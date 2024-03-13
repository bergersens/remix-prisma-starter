import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ParsedLanguage {
  code: string;
  region?: string;
  quality: number;
}

export function parseAcceptLanguageHeader(
  acceptLanguageHeader: string | null
): string {
  if (!acceptLanguageHeader) {
    return "";
  }

  const parsedLanguages = acceptLanguageHeader.split(",").map((entry) => {
    const [language, quality] = entry.trim().split(";q=");
    const [code, region] = language.split("-");
    return {
      code: code,
      region: region || undefined,
      quality: quality ? parseFloat(quality) : 1.0,
    } as ParsedLanguage;
  });

  return (
    parsedLanguages.reduce((prev, current) => {
      return prev.quality > current.quality ? prev : current;
    }).code || ""
  );
}
