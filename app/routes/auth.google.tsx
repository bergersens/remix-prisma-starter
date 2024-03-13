import { redirect, type LoaderFunctionArgs } from "@remix-run/server-runtime";
import { google } from "googleapis";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const redirectUri = `${
    process.env.VERCEL_ENV === "development" ? "http" : "https"
  }://${request.headers.get("host")}/auth/google-token`;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  console.log(params);

  const scopes = ["profile", "email"];

  if (params.code) {
    // Get access and refresh tokens (if access_type is offline)
    let { tokens } = await oauth2Client.getToken(params.code);
    oauth2Client.setCredentials(tokens);
    return null;
  }

  if (params.error) {
    // Get access and refresh tokens (if access_type is offline)
    console.log(params.error);
    return null;
  }

  const authorizationUrl = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",
    /** Pass in the scopes array defined above.
     * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
    scope: scopes,
    // Enable incremental authorization. Recommended as a best practice.
    include_granted_scopes: true,
  });

  return redirect(authorizationUrl);
};
