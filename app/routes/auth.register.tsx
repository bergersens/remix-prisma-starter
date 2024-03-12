import { Label } from "@radix-ui/react-label";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { getUser, register } from "~/utils/auth.server";

const schema = z.object({
  email: z
    .string({ required_error: "E-mail must be set" })
    .email("Email does not match"),
  password: z
    .string({ required_error: "Password must be set." })
    .min(5, "Password must be more than 5 characters long"),
  firstName: z.string({ required_error: "First name must be set." }),
  lastName: z.string({ required_error: "Last name must be set." }),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const payload = await request.formData();

  const result = schema.safeParse(Object.fromEntries(payload));

  if (!result.success) {
    return json(
      {
        error: "form-validation",
        fieldErrors: result.error.flatten().fieldErrors,
        payload,
      },
      { status: 400 }
    );
  }

  return await register(result.data);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // If there's already a user in the session, redirect to the home page
  if (await getUser(request)) redirect("/");

  const email = new URL(request.url).searchParams.get("email");

  return email;
};

export default function Login() {
  const actionData = useActionData<{
    error?: string;
    payload?: FormData;
    fieldErrors: z.inferFlattenedErrors<typeof schema>["fieldErrors"];
  }>();
  const email = useLoaderData<typeof loader>();

  return (
    <Form method="POST">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Register</CardTitle>
        <CardDescription>
          Enter your email, password, first name and last name to register a new
          account
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
              className={
                actionData?.fieldErrors.password ? "border-red-500" : ""
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              required
              name="firstName"
              className={
                actionData?.fieldErrors.firstName ? "border-red-500" : ""
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              required
              name="lastName"
              className={
                actionData?.fieldErrors.lastName ? "border-red-500" : ""
              }
            />
          </div>

          <Button className="w-full" type="submit">
            Register
          </Button>
        </div>
      </CardContent>
    </Form>
  );
}
