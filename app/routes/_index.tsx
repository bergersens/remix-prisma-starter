import { json, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs, MetaFunction } from "@vercel/remix";
import { Button } from "~/components/ui/button";
import { parseAcceptLanguageHeader } from "~/lib/utils";
import { getUser, requireUserId } from "~/utils/auth.server";

export const meta: MetaFunction = () => {
  return [
    { title: "My Remix App" },
    { name: "description", content: "Remix!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const lang = parseAcceptLanguageHeader(
    request.headers.get("Accept-Language")
  );

  console.log(lang);

  await requireUserId(request);

  const user = await getUser(request);
  return json(user);
};

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen flex items-center justify-center w-full dark:bg-gray-950">
      {loaderData?.email}
      <form method="POST" action="/auth/logout">
        <Button type="submit">Logout</Button>
      </form>
    </div>
  );
}
