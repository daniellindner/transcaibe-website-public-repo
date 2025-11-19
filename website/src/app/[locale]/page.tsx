import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import "../globals.css";
import TranscribeApp from "@/app/_components/stepper-components/TranscribeApp";
import HowToUseInfo from "@/app/_components/HowToUseInfo";
import Pricing from "@/app/_components/Pricing/Pricing";
import Testimonials from "@/app/_components/Testimonials";
import Privacy from "@/app/_components/Privacy";
import PreviousOrderBanner from "@/app/_components/PreviousOrderBanner";
import FaqTable from "@/app/_components/FaqTable";
import TranscriptionDetails from "@/app/_components/TranscriptionDetails";
import Stack from "@mui/material/Stack";
import {
  NextIntlClientProvider,
  useMessages,
  useTranslations,
} from "next-intl";
import pick from "lodash/pick";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";

export default function Home() {
  const t = useTranslations("LandingPage");
  const messages = useMessages();

  return (
    <React.Fragment>
      <CssBaseline />
      <Container
        sx={{
          bgcolor: "primary.main",
          minWidth: "100vw",
          minHeight: "calc(100vh - 64px)",
          flexGrow: 1,
          padding: 0,
          margin: 0,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center", // Adjusted to align items to the start of the container
        }}
      >
        <Box sx={{ my: "3vh" }}>
          <NextIntlClientProvider messages={pick(messages, "LandingPage")}>
            <PreviousOrderBanner />
          </NextIntlClientProvider>
        </Box>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            justifyContent: "center",
            color: "background.paper",
            mt: "2vh",
            mb: "2vh",
            textAlign: "center",
            width: 0.9,
          }}
        >
          {t("title")}
        </Typography>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            color: "background.paper",
            justifyContent: "center",
            mt: "2vh",
            mb: "11vh",
            textAlign: "center",
            width: 0.7,
          }}
        >
          {t("subtitle")}
        </Typography>

        <NextIntlClientProvider messages={pick(messages, "TranscribeApp")}>
          <TranscribeApp />
        </NextIntlClientProvider>
      </Container>

      <Container component="main" sx={{ mb: "10vh" }}>
        <Stack direction="column" spacing={10}>
          <HowToUseInfo />
          <TranscriptionDetails />
          <Pricing />
        </Stack>
      </Container>

      <Testimonials />

      <Container component="main" sx={{ mb: "10vh" }}>
        <Stack direction="column" spacing={10}>
          <NextIntlClientProvider messages={pick(messages, "FAQ")}>
            <FaqTable />
          </NextIntlClientProvider>
          <Privacy />
        </Stack>
      </Container>
    </React.Fragment>
  );
}
