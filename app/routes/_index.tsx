import { json, useLoaderData } from "@remix-run/react";
import type { LoaderFunction, MetaFunction } from "@vercel/remix";
import { Button } from "~/components/ui/button";
import { getUser, requireUserId } from "~/utils/auth.server";
import { RegisterForm } from "~/utils/types.server";

export const meta: MetaFunction = () => {
  return [
    { title: "My Remix App" },
    { name: "description", content: "Remix!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  await requireUserId(request);
  const user = await getUser(request);
  return json(user);
};

export default function Index() {
  const loader = useLoaderData<RegisterForm | null>();

  return (
    <div className="min-h-screen flex items-center justify-center w-full dark:bg-gray-950">
      {loader?.email}
      <form method="POST" action="/logout">
        <Button type="submit">Antonia ist schlecht</Button>
      </form>
    </div>
  );
}
