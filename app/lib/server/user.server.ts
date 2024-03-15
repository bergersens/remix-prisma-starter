import bcrypt from "bcryptjs";

import type { User } from "@prisma/client";
import { prisma } from "~/lib/server/db.server";

export const createUser = async (
  user: Pick<User, "email" | "firstName" | "lastName" | "password"> & {
    password: string;
  }
) => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      password: passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
  return { id: newUser.id, email: user.email };
};

export const createOauthUser = async (
  user: Pick<User, "email" | "firstName" | "lastName">
) => {
  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  });
  return { id: newUser.id, email: user.email };
};
