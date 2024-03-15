import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { google } from "googleapis";
import { registerOrLoginGoogle } from "~/lib/server/auth.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  console.log("token exchange");

  const redirectUri = `${
    process.env.VERCEL_ENV === "development" ? "http" : "https"
  }://${request.headers.get("host")}/auth/google-token`;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const code = new URL(request.url).searchParams.get("code");

  if (!code) {
    return null;
  }

  let { tokens } = await oauth2Client.getToken(code);

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
  });

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });

  const { data } = await oauth2.userinfo.get();

  console.log("userdata", data);

  if (!data?.email || !data.id) {
    throw redirect("/");
  }

  return registerOrLoginGoogle({
    email: data.email,
    firstName: data.given_name || "",
    lastName: data.family_name || "",
  });
};
