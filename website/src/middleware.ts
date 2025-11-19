import createMiddleware from "next-intl/middleware";
import { localePrefix, locales } from "./navigation";

export default createMiddleware({
  // Used when no locale matches
  defaultLocale: "en",

  // A list of all locales that are supported
  localePrefix,
  locales,
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(de|en|fr|es|it|se|hi|zh|pt|tr|pl|ar)/:path*"],
};
