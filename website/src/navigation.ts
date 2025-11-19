import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { FlagIconCode } from "react-flag-kit";

export const locales = [
  "en",
  "de",
  "fr",
  "es",
  "it",
  "se",
  "hi",
  "zh",
  "pt",
  "tr",
  "pl",
  "ar",
] as const;

export type Locale = (typeof locales)[number]; // This creates a union type of all your locales

export const localeLabels: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  it: "Italiano",
  se: "Svenska",
  hi: "हिंदी",
  zh: "中文",
  pt: "Português",
  tr: "Türkçe",
  pl: "Polski",
  ar: "العربية",
};

export const localeCountryCode: Record<Locale, FlagIconCode> = {
  en: "US", // United States for English
  de: "DE", // Germany for Deutsch
  fr: "FR", // France for Français
  es: "ES", // Spain for Español
  it: "IT", // Italy for Italiano
  se: "SE", // Sweden for Svenska
  hi: "IN", // India for हिंदी
  zh: "CN", // China for 中文
  pt: "PT", // Portugal for Português
  tr: "TR", // Turkey for Türkçe
  pl: "PL", // Poland for Polski
  ar: "SA", // Saudi Arabia for العربية
};

export const localePrefix = "always"; // Default

export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({ locales, localePrefix });
