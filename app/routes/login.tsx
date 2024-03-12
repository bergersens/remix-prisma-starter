import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import type { LoaderFunction } from "@vercel/remix";
import { useEffect, useRef, useState } from "react";
import { getUser, login, register } from "~/utils/auth.server";
import type { RegisterForm } from "~/utils/types.server";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "~/utils/validators.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const action = form.get("_action");
  const email = form.get("email");
  const password = form.get("password");
  let firstName = form.get("firstName");
  let lastName = form.get("lastName");

  console.log(action, email, password, firstName, lastName);

  if (
    typeof action !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
  }

  if (
    action === "register" &&
    (typeof firstName !== "string" || typeof lastName !== "string")
  ) {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
  }

  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    ...(action === "register"
      ? {
          firstName: validateName((firstName as string) || ""),
          lastName: validateName((lastName as string) || ""),
        }
      : {}),
  };
  console.log(errors);

  if (Object.values(errors).some(Boolean))
    return json(
      {
        errors,
        fields: { email, password, firstName, lastName },
        form: action,
      },
      { status: 400 }
    );

  switch (action) {
    case "login": {
      return await login({ email, password });
    }
    case "register": {
      firstName = firstName as string;
      lastName = lastName as string;
      return await register({ email, password, firstName, lastName });
    }
    default:
      return json({ error: `Invalid Form Data` }, { status: 400 });
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  // If there's already a user in the session, redirect to the home page
  return (await getUser(request)) ? redirect("/") : null;
};

export default function Login() {
  // 1
  const actionData = useActionData() as {
    error?: any;
    errors?: any;
    fields: RegisterForm;
  };

  const [actionType, setActionType] = useState<"login" | "register">("login");
  // 2
  const firstLoad = useRef(true);
  const [errors, setErrors] = useState(actionData?.errors || {});
  const [formError, setFormError] = useState(actionData?.error || "");

  const [formData, setFormData] = useState<RegisterForm>({
    email: actionData?.fields?.email || "",
    password: actionData?.fields?.password || "",
    firstName: actionData?.fields?.lastName || "",
    lastName: actionData?.fields?.firstName || "",
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: keyof RegisterForm
  ) => {
    setFormData((form) => ({ ...form, [field]: event.target.value }));
  };

  useEffect(() => {
    if (!firstLoad.current) {
      const newState = {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
      };
      setErrors(newState);
      setFormError("");
      setFormData(newState);
    }
  }, [actionType]);

  useEffect(() => {
    if (!firstLoad.current) {
      setFormError("");
    }
  }, [formData]);

  useEffect(() => {
    firstLoad.current = false;
  }, []);

  return (
    <div className="h-full justify-center items-center flex flex-col gap-y-4">
      <h2 className="text-5xl font-extrabold text-yellow-300">
        Welcome to Kudos!
      </h2>
      <p>{formError}</p>
      <p className="font-semibold text-slate-300">
        {actionType === "login"
          ? "Log In To Give Some Praise!"
          : "Sign Up To Get Started!"}
      </p>
      <button
        onClick={() => {
          setActionType((old) => (old === "login" ? "register" : "login"));
        }}
      >
        {actionType === "login" ? "Sign Up" : "Login"}
      </button>
      <form method="post" className="rounded-2xl bg-gray-200 p-6 w-96">
        <label htmlFor="email" className="text-blue-600 font-semibold">
          Email
        </label>
        <input
          type="text"
          id="email"
          name="email"
          className="w-full p-2 rounded-xl my-2"
          onChange={(e) => handleInputChange(e, "email")}
        />
        {errors?.email}

        <label htmlFor="password" className="text-blue-600 font-semibold">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="w-full p-2 rounded-xl my-2"
          onChange={(e) => handleInputChange(e, "password")}
        />
        {errors?.password}

        {actionType === "register" && (
          <>
            <label htmlFor="lastName" className="text-blue-600 font-semibold">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="w-full p-2 rounded-xl my-2"
              onChange={(e) => handleInputChange(e, "lastName")}
            />
            {errors?.firstName}
            <label htmlFor="firstName" className="text-blue-600 font-semibold">
              firstName
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="w-full p-2 rounded-xl my-2"
              onChange={(e) => handleInputChange(e, "firstName")}
            />
            {errors?.lastName}
          </>
        )}

        <div className="w-full text-center">
          <button
            type="submit"
            name="_action"
            value={actionType}
            className="rounded-xl mt-2 bg-yellow-300 px-3 py-2 text-blue-600 font-semibold transition duration-300 ease-in-out hover:bg-yellow-400 hover:-translate-y-1"
          >
            {actionType === "login" ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </form>
    </div>
  );
}
