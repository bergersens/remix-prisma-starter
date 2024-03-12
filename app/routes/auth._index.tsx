import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
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
import { userExists } from "~/utils/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const payload = await request.formData();

  const schema = zfd.formData({
    email: zfd.text(
      z
        .string({ required_error: "E-mail must be set" })
        .email("Email does not match")
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

  const isUser = await userExists(result.data.email);

  if (isUser) {
    return redirect("/auth/login?email=" + result.data.email);
  } else return redirect("/auth/register?email=" + result.data.email);
};

export default function Auth() {
  return (
    <Form method="POST">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
        <CardDescription>Please enter your email</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              id="email"
              placeholder="m@example.com"
              required
              type="email"
              name="email"
              autoFocus
            />
          </div>

          <Button className="w-full" type="submit">
            Next
          </Button>
        </div>
      </CardContent>
    </Form>
  );
}
