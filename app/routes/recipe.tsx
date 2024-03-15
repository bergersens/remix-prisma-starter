import { json, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/server-runtime";
import { ArrowDown } from "lucide-react";
import OpenAI from "openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { requireUserId } from "~/lib/server/auth.server";

export const config = {
  maxDuration: 10,
};

const schema = z.object({
  title: z
    .string()
    .describe(
      "<hier bitte einen coolen und womöglich lustigen titel für dieses rezept finden>"
    ),
  emoji: z
    .string()
    .describe("<ein passende emojikombination aus 3 emojis für dieses rezept>"),

  description: z
    .string()
    .describe(
      "<eine kurze beschreibung, die appetit auf das gericht macht und grob umschreibt, was das gericht am ende werden soll>"
    ),
  ingredients: z.array(
    z.object({
      name: z.string().describe("<name der hauptzutat>"),
      amount: z
        .string()
        .describe("<notwendige menge der hauptzutat im rezept als nummer>"),
      unit: z
        .string()
        .describe(
          "<einheit der menge der hauptzutat, wie beispielsweise kilogramm oder liter>"
        ),

      alternative: z.object({
        name: z
          .string()
          .describe(
            "<name der alternativzutat, falls die hauptzutat nicht im haus sein sollte. ie Alternativzutat sollte ein ähnlich gutes ergbnis des rezptes liefern und die hauptzutat sehr gut ersetzen können.>"
          ),
        amount: z
          .string()
          .describe(
            "<notwendige menge der alternativzutat der im rezept als nummer>"
          ),
        unit: z
          .string()
          .describe(
            "<einheit der menge der alternativzutat, wie beispielsweise kilogramm oder liter>"
          ),
      }),
    })
  ),
  steps: z.array(
    z.object({
      description: z
        .string()
        .describe(
          "<hier eine vollständige und verständliche Beschreibung des schrittes, um das rezept zu kochen>"
        ),
      ingredients: z
        .array(z.string())
        .describe("<jede in diesem schritt verwendete zutat>"),
      appliances: z
        .array(z.string())
        .describe("<jedes in diesem schritt verwendete Küchengerät>"),
    })
  ),
});

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request);

  const ingredients = new URL(request.url).searchParams.getAll("id");

  const openai = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
  });

  const jsonStructure = zodToJsonSchema(schema, "mySchema");
  if (!jsonStructure) return null;

  const utensilien = ["backofen", "herd", "mikrowelle"];

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: [
      {
        role: "system",
        content: `ich bin auf der suche nach einem rezept, welches ausschließlich folgende zutaten enthalten darf: 
        ${ingredients.join(", ")}.
        gewürze habe ich alle gängigen zuhause. An Küchenaustattung habe ich: ${utensilien.join(
          ", "
        )}. 
        bitte geb mir ein für mich indivduelles und leckeres rezept aus, welches mit meinen vorhandenen Zutaten & Küchenaustattung kochen kann.  
        dies bitte in form einer json. Die JSON Struktur sieht folgendermaßen aus und ist ein valides json schema: ${JSON.stringify(
          jsonStructure
        )}. Bitte gebe mir als antwort eine valide json anhand des schemas. im feld "description" steht eine anweisung, was ich hier erwarte. die json soll kein json schema sein, sondern nach dem schema aufgebaut sein, daher musst du wahrscheinlich einige dinge aus dieser entfernen.`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response?.choices[0].message.content;
  console.log("content");

  console.log(content);

  return content ? json(JSON.parse(content) as z.infer<typeof schema>) : null;
};

const boldWordsInString = (inputString: string, wordsToBold: string[]) =>
  inputString
    .split(/\b/)
    .map((word, index) =>
      wordsToBold
        .map((word) => word.toLowerCase())
        .includes(word.toLowerCase()) ? (
        <b key={index}>{word}</b>
      ) : (
        word
      )
    );

const Result = () => {
  const loaderData = useLoaderData<typeof loader>();

  if (!loaderData) return <>Error</>;

  return (
    <div className="h-screen flex items-center text-lg">
      <Card className="mx-auto max-w-4xl border-none shadow-none">
        <CardHeader>
          <CardTitle>
            <h1 className="text-center scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              {loaderData.title}
            </h1>
            <p className="text-center text-5xl my-8">{loaderData.emoji}</p>
          </CardTitle>
          <CardDescription className="text-lg text-center">
            {loaderData.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h2 className="text-2xl text-center font-bold lg:text-3xl mt-16 mb-6">
            Zubereitung
          </h2>
          <div>
            {loaderData.steps.map((step, index) => (
              <div className="flex flex-col items-center" key={`step-${index}`}>
                <div className="text-muted-foreground my-2">
                  <p className="leading-7 [ &:not(:first-child)]:mt-6">
                    {boldWordsInString(step.description, [
                      ...step.ingredients,
                      ...step.appliances,
                    ])}
                  </p>
                </div>
                {index < loaderData.steps.length - 1 && (
                  <ArrowDown className="my-2 text-muted-foreground"></ArrowDown>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default Result;
