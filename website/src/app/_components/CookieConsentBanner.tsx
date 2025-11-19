"use client";

import CookieConsent from "react-cookie-consent";
import { bottom } from "@popperjs/core";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import "../globals.css";

export default function CookieBanner({
  content,
  buttonText,
}: {
  content: string;
  buttonText: string;
}) {
  const theme = useTheme().palette;

  return (
    <CookieConsent
      location={bottom}
      cookieName={"generalCookieConsent"}
      expires={90}
      style={{
        display: "flex",
        background: theme.background.default,
        justifyContent: "center",
        alignItems: "center",
      }}
      buttonStyle={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: theme.background.default,
        background: theme.primary.main,
        fontSize: "inherit",
        borderRadius: 5,
      }}
      buttonText={buttonText}
    >
      <Typography sx={{ color: theme.primary.main }}>{content}</Typography>
    </CookieConsent>
  );
}
