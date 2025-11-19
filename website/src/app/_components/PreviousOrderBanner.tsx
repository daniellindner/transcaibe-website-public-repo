// This component checks, if the cookie "lastOrder" exists. If it does, it will display a banner with a link to the previous order.
"use client";
import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import { useTranslations } from "next-intl";

export default function PreviousOrderBanner() {
  const theme = useTheme();
  const t = useTranslations("LandingPage");
  const [lastOrder, setLastOrder] = useState("");

  useEffect(() => {
    const cookieValue =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("lastOrder="))
        ?.split("=")[1] || ""; // Fallback to an empty string if undefined

    // Check if cookieValue is exactly 17 digits
    const isValid = /^.{17}$/.test(cookieValue);
    //example: 2FN45219VR554441M

    if (isValid) {
      setLastOrder(cookieValue);
    } else {
      // Handle the case where cookieValue does not match the criteria
      // For example, set lastOrder to null or keep it as an empty string
      // Depending on your application's logic, you might want to take different actions here
      setLastOrder(""); // or set to null or any other fallback handling
    }
  }, []);

  if (!lastOrder) {
    return null; // Or any placeholder content you'd like to show before the cookie is read
  }
  return (
    <Button
      variant="outlined"
      href={`/?id=${lastOrder}`}
      component="a"
      size="large"
      style={{
        color: theme.palette.background.default,
        borderColor: theme.palette.background.default,
        borderRadius: 5,
      }}
    >
      {t("previousOrder")}
    </Button>
  );
}
