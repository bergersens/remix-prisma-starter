import { z } from "zod";

export const RegisterForm = z.object({
  email: z
    .string({ required_error: "E-mail must be set" })
    .email("Email does not match"),
  password: z
    .string({ required_error: "Password must be set." })
    .min(5, "Password must be more than 5 characters long"),
  firstName: z.string({ required_error: "First name must be set." }),
  lastName: z.string({ required_error: "Last name must be set." }),
});

export const LoginForm = z.object({
  email: z
    .string({ required_error: "E-mail must be set" })
    .email("Email does not match"),
  password: z
    .string({ required_error: "Password must be set." })
    .min(5, "Password must be more than 5 characters long"),
});
