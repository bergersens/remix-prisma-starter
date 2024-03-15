import { Form } from "@remix-run/react";
import type { FC, PropsWithChildren } from "react";
import { Button } from "./ui/button";

export const LogoutButton = () => {
  return (
    <Form action="/auth/logout" method="POST">
      <Button type="submit" variant="secondary">
        Logout
      </Button>
    </Form>
  );
};

export const LoginButton = () => {
  return (
    <Form action="/auth/login" method="POST">
      <Button type="submit" variant="secondary">
        Login
      </Button>
    </Form>
  );
};

export const Header: FC<PropsWithChildren<{ user?: { name?: string } }>> = ({
  user,
}) => {
  return (
    <div className="flex w-screen items-center justify-between border-b py-4 px-6">
      <div className="flex gap-x-4 items-center">
        {user?.name && <h1>Hallo {user.name}</h1>}
      </div>

      {user ? <LogoutButton /> : <LoginButton />}
    </div>
  );
};
