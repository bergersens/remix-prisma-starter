import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import type { LoaderFunction } from "@vercel/remix";
import type { PropsWithChildren } from "react";
import { Card } from "~/components/ui/card";
import { getUser } from "~/lib/server/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  // If there's already a user in the session, redirect to the home page
  return (await getUser(request)) ? redirect("/") : null;
};

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="h-screen flex items-center">
      <Card className="mx-auto max-w-sm w-96">
        <Outlet />
      </Card>
    </div>
  );
}
