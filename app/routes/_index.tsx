import { Link, json, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs, MetaFunction } from "@vercel/remix";
import { useState } from "react";
import { Header } from "~/components/Header";
import { Button } from "~/components/ui/button";
import type { Tag } from "~/components/ui/tag";
import { TagInput } from "~/components/ui/tag-input";
import { getUser, requireUserId } from "~/lib/server/auth.server";
import { parseAcceptLanguageHeader } from "~/lib/server/utils.server";

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
  console.log(user);

  return json(user);
};
const autocompleteOptions: Tag[] = [
  { id: "nice", text: "Nudeln" },
  { id: "nice", text: "Tomaten" },
  { id: "nice", text: "Eier" },
];
export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  const [tags, setTags] = useState<Tag[]>([]);

  const searchParams = new URLSearchParams(tags.map((s) => ["id", s.text]));

  return (
    <div className="h-screen">
      <Header user={{ name: loaderData?.firstName }} />
      <div className="mt-24 flex flex-col items-center justify-center max-w-3xl mx-auto dark:bg-gray-950">
        <TagInput
          autocompleteOptions={autocompleteOptions}
          enableAutocomplete={true}
          size="lg"
          placeholder="Welche Zutaten hast du noch?"
          tags={tags}
          setTags={(newTags) => {
            setTags(newTags);
          }}
        />

        <Link to={`/recipe?${searchParams}`}>
          <Button className="w-full mt-6" size="lg" type="submit">
            Los gehts
          </Button>
        </Link>
      </div>
    </div>
  );
}
