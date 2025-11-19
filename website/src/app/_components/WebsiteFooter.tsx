import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";
import {
  NextIntlClientProvider,
  useLocale,
  useMessages,
  useTranslations,
} from "next-intl";
import Container from "@mui/material/Container";
import AvailableLanguages from "@/app/_components/AvailableLanguages";
import { Button } from "@mui/material";
import React from "react";
import pick from "lodash/pick";

function Footer() {
  const t = useTranslations("Footer");
  const messages = useMessages();
  const local = useLocale();
  return (
    <Container>
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-evenly",
          flexDirection: "row",
          my: "5vh",
          "@media (max-width: 767px)": {
            // Apply for screens smaller than 768px
            flexDirection: "column", // Change flexDirection to column for small screens
            gap: "10px",
          },
        }}
      >
        <Button variant="outlined" href={"/" + local + "/imprint"}>
          {t("imprint")}
        </Button>
        <Button variant="outlined" href={"/" + local + "/terms"}>
          {t("terms")}
        </Button>
        <NextIntlClientProvider messages={pick(messages, "Footer")}>
          <AvailableLanguages />
        </NextIntlClientProvider>
        <Button variant="outlined" href={"/" + local}>
          <HomeIcon />
        </Button>
      </Container>

      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-evenly",
          flexDirection: "column",
          my: "2vh",
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          {"© "}
          {new Date().getFullYear()}
          {"."}
        </Typography>
      </Container>
    </Container>
  );
}

export default Footer;
