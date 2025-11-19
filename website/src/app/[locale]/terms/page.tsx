import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useTranslations } from "next-intl";
import "../../globals.css";

export default function TermsAndConditions() {
  const t = useTranslations();

  return (
    <Container
      id={"terms"}
      sx={{
        py: "10vh",
      }}
    >
      <Typography
        variant={"h2"}
        sx={{
          pb: "5vh",
        }}
      >
        {t("Terms.title")}
      </Typography>

      <Stack direction={"column"} spacing={4}>
        <Typography variant={"h4"}>{t("Terms.validity.headline")}</Typography>

        <Typography variant={"body1"}>
          {t.rich("Terms.validity.content")}
        </Typography>

        <Typography variant={"h4"}>
          {t("Terms.contractConditions.headline")}
        </Typography>

        <Typography variant={"body1"}>
          {t.rich("Terms.contractConditions.content")}
        </Typography>

        <Typography variant={"h4"}>
          {t("Terms.priceAndPayment.headline")}
        </Typography>

        <Typography variant={"body1"}>
          {t("Terms.priceAndPayment.content")}
        </Typography>

        <Typography variant={"h4"}>
          {t("Terms.uptimeSecurity.headline")}
        </Typography>

        <Typography variant={"body1"}>
          {t("Terms.uptimeSecurity.content")}
        </Typography>

        <Typography variant={"h4"}>{t("Terms.copyright.headline")}</Typography>

        <Typography variant={"body1"}>
          {t("Terms.copyright.content")}
        </Typography>

        <Typography variant={"h4"}>
          {t("Terms.modifications.headline")}
        </Typography>

        <Typography variant={"body1"}>
          {t("Terms.modifications.content")}
        </Typography>

        <Typography variant={"h4"}>
          {t("Terms.governingLaw.headline")}
        </Typography>

        <Typography variant={"body1"}>
          {t("Terms.governingLaw.content")}
        </Typography>
      </Stack>
    </Container>
  );
}
