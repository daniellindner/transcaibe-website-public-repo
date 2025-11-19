import * as React from "react";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useTranslations } from "next-intl";

export default function Privacy() {
  const t = useTranslations("Privacy");
  return (
    <Container id={"privacy"}>
      <Typography variant="h3">{t("title")}</Typography>
      <Typography variant="h5" gutterBottom>
        {t("subtitle")}
      </Typography>

      <Typography variant="body1">{t("retPolicy.headline")}</Typography>
      <Typography variant="body1">{t("retPolicy.content")}</Typography>
      <br />
      <Typography variant="body1">{t("encSecurity.headline")}</Typography>
      <Typography variant="body1">{t("encSecurity.content")}</Typography>
      <br />
      <Typography variant="body1">
        {t("noThirdPartySharing.headline")}
      </Typography>
      <Typography variant="body1">
        {t("noThirdPartySharing.content")}
      </Typography>
    </Container>
  );
}
