import { Label } from "@radix-ui/react-label";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { Button } from "~/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { getUser, login } from "~/utils/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const payload = await request.formData();

  const schema = zfd.formData({
    email: zfd.text(
      z
        .string({ required_error: "E-mail must be set" })
        .email("Email does not match")
    ),
    password: zfd.text(
      z
        .string({ required_error: "Password must be set." })
        .min(5, "Password must be more than 5 characters long")
    ),
  });

  const result = schema.safeParse(payload);

  if (!result.success) {
    return json(
      {
        error: result.error.flatten(),
        payload,
      },
      { status: 400 }
    );
  }

  return await login(result.data);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // If there's already a user in the session, redirect to the home page
  if (await getUser(request)) redirect("/");

  const email = new URL(request.url).searchParams.get("email");

  return email;
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const email = useLoaderData<typeof loader>();

  const isError = !!actionData?.error;

  return (
    <Form method="POST">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Enter your email and password to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              placeholder="m@example.com"
              required
              type="email"
              name="email"
              defaultValue={email || ""}
              autoFocus={!email}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              required
              type="password"
              name="password"
              autoFocus={!!email}
            />
          </div>
          {isError && <p>{actionData.error.toString()}</p>}
          <Button className="w-full" type="submit">
            Login
          </Button>
        </div>
      </CardContent>
    </Form>
  );
}
