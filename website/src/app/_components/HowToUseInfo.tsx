import React from "react";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import { useTranslations } from "next-intl";
import IconStep1 from "@/app/_components/SVG_Components/IconStep1";
import IconStep2 from "@/app/_components/SVG_Components/IconStep2";
import IconStep3 from "@/app/_components/SVG_Components/IconStep3";
import { Box } from "@mui/material";

export default function HowToUseInfo() {
  const t = useTranslations("HowToUse");
  return (
    <Container
      id={"howToUse"}
      sx={{
        pt: "20vh",
      }}
    >
      <Container id={"instructionStack"}>
        <Typography variant={"h3"}>{t("title")}</Typography>
        <Typography variant="h5" gutterBottom sx={{ pt: "1vh" }}>
          {t("subtitle")}
        </Typography>

        <Stack direction={"column"} spacing={5} sx={{ pt: "3vh" }}>
          <Container
            disableGutters
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                minWidth: "50px",
                minHeight: "50px",
              }}
            >
              <IconStep1 />
            </Box>

            <Typography
              variant="body1"
              sx={{
                pl: "20px",
              }}
            >
              {t("Step1.content")}
            </Typography>
          </Container>

          <Container
            disableGutters
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                minWidth: "50px",
                minHeight: "50px",
              }}
            >
              <IconStep2 />
            </Box>

            <Typography
              variant="body1"
              sx={{
                pl: "20px",
              }}
            >
              {t("Step2.content")}
            </Typography>
          </Container>

          <Container
            disableGutters
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                minWidth: "50px",
                minHeight: "50px",
              }}
            >
              <IconStep3 />
            </Box>

            <Typography
              variant="body1"
              sx={{
                pl: "20px",
              }}
            >
              {t("Step3.content")}
            </Typography>
          </Container>
        </Stack>
      </Container>
    </Container>
  );
}
