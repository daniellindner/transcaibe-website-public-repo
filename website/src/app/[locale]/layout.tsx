import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter"; // or `v14-appRouter` if you are using Next.js v14
import LogoTopAppBar from "@/app/_components/LogoTopAppBar";
import * as React from "react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/app/theme";
import Footer from "@/app/_components/WebsiteFooter";
import CookieBanner from "@/app/_components/CookieConsentBanner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  NextIntlClientProvider,
  useMessages,
  useTranslations,
} from "next-intl";
import pick from "lodash/pick";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = useMessages();
  const t = useTranslations();
  return (
    <html lang={locale}>
      <body>
        <ThemeProvider theme={theme}>
          {/*Passing the translations here is necessary, since CookieBanner is a Client side component*/}
          <CookieBanner
            content={t("CookieBanner.content")}
            buttonText={t("CookieBanner.buttonText")}
          />
          <NextIntlClientProvider messages={pick(messages, "LogoTopAppBar")}>
            <LogoTopAppBar />
          </NextIntlClientProvider>
          <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
          <Footer />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
