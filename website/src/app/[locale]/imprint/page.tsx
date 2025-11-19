import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import "../../globals.css";
import { Box } from "@mui/material";

export default function Imprint() {
  const t = useTranslations("Imprint");
  return (
    <Container>
      <Box>
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            mt: "10vh",
          }}
        >
          {t("title")}
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{
            py: "2vh",
          }}
        >
          {t.rich("info")}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {t.rich("representedBy.headline")}
          <br />
          {t.rich("representedBy.content")}
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{
            py: "2vh",
          }}
        >
          {t.rich("contact.headline")}
          <br />
          {t.rich("contact.content")}
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{
            py: "2vh",
          }}
        >
          {t.rich("taxID.headline")}
          <br />
          {t.rich("taxID.content")}
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{
            py: "2vh",
          }}
        >
          {t.rich("regulatoryAuthority.headline")}
          <br />
          {t.rich("regulatoryAuthority.content")}
          <br />
        </Typography>
      </Box>
    </Container>
  );
}
