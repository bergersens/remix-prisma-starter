import type {
  HeadersFunction,
  LoaderFunctionArgs,
} from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";

export const config = {
  runtime: "edge",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  let headers = {
    "Cache-Control": "max-age=3600, public",
  };

  return json(
    { message: "Hello World" + new Date().toISOString() },
    { status: 200, headers }
  );
};

export let headers: HeadersFunction = ({ loaderHeaders }) => {
  return { "Cache-Control": loaderHeaders.get("Cache-Control") || "" };
};
