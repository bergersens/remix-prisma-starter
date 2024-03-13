import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useNavigation } from "@remix-run/react";
import { Loader2, Mail } from "lucide-react";
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
  const { state } = useNavigation();
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

          <Button
            className="w-full"
            type="submit"
            disabled={state === "submitting"}
          >
            {state === "submitting" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Continue with email
          </Button>

          <CardDescription className="text-center py-2">- or -</CardDescription>

          <Link to={"/auth/google"}>
            <Button variant="google" className="w-full">
              {state === "submitting" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 -ml-1 w-4 h-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
              )}
              Continue with Google
            </Button>
          </Link>
        </div>
      </CardContent>
    </Form>
  );
}
