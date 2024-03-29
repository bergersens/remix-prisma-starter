import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { Analytics } from "@vercel/analytics/react";
import type { LinksFunction } from "@vercel/remix";
import { SpeedInsights } from "@vercel/speed-insights/remix";

import { GlobalLoading } from "./components/GlobalProgress";
import globals from "./globals.css?url";
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: globals },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Analytics />
        <SpeedInsights />
        <GlobalLoading />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
