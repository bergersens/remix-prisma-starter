import bcrypt from "bcryptjs";
import { prisma } from "~/db.server";

import { createCookieSessionStorage, json, redirect } from "@remix-run/node";

import type { User } from "@prisma/client";
import { createUser } from "./user.server";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "kudos-session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function register(
  user: Pick<User, "email" | "firstName" | "lastName" | "password">
) {
  const exists = await prisma.user.count({ where: { email: user.email } });
  if (exists) {
    return json({ error: `user-exists` }, { status: 400 });
  }

  const newUser = await createUser(user);
  if (!newUser) {
    return json(
      {
        error: `cannot-create-user`,
      },
      { status: 400 }
    );
  }

  return createUserSession(newUser.id, "/");
}

export async function login({
  email,
  password,
}: Pick<User, "email" | "password">) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password)))
    return json({ error: `Incorrect login` }, { status: 400 });

  return createUserSession(user.id, "/");
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/auth?${searchParams}`);
  }
  return userId;
}

function getUserSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    return user;
  } catch {
    throw logout(request);
  }
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  const user = await getUser(request);

  return redirect("/auth/login" + user ? "?email=" + user?.email : "", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function userExists(email: string) {
  const user = await prisma.user.count({
    where: { email },
  });
  return !!user;
}
