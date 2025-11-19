import TranslateIcon from "@mui/icons-material/Translate";
import VoiceIcon from "./SVG_Components/VoiceIcon";
import DownloadFileIcon from "./SVG_Components/DownloadFileIcon";
import AiIcon from "./SVG_Components/AiIcon";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";
import { Box } from "@mui/material";

export default function TranscriptionDetails() {
  const t = useTranslations("TranscriptionDetails");

  return (
    <Container
      id={"transcriptionDetails"}
      disableGutters
      sx={{
        my: "10vh",
        pt: "10vh",
        width: "auto",
        bgcolor: "background.default",
      }}
    >
      {/* In the next container, three icons should be displayed with text uderneath them.*/}

      <Container
        disableGutters
        id={"transcriptionDetailsContainer"}
        sx={{
          pr: 0,
          display: "flex",
          justifyContent: "space-between",
          "@media (max-width: 767px)": {
            // Apply for screens smaller than 768px
            flexDirection: "column", // Change flexDirection to column for small screens
          },
        }}
      >
        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "25%",
            "@media (max-width: 767px)": {
              flexDirection: "row",
              justifyContent: "space-between",
              mx: 0,
              py: "5vh",
              width: "auto",
            },
          }}
        >
          <Box
            sx={{
              w: "100px",
              h: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <VoiceIcon />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              "@media (max-width: 767px)": {
                flexDirection: "column",
                pl: "5vw",
              },
            }}
          >
            <Typography variant={"h6"} sx={{ mt: "3vh" }}>
              {t("uploadHeader")}
            </Typography>
            <Typography variant={"body1"} sx={{ mt: "3vh" }}>
              {t.rich("uploadBody")}
            </Typography>
          </Box>
        </Container>

        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "25%",
            "@media (max-width: 767px)": {
              flexDirection: "row",
              justifyContent: "space-between",
              mx: 0,
              py: "5vh",
              width: "auto",
            },
          }}
        >
          <Box
            sx={{
              w: "100px",
              h: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AiIcon />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              "@media (max-width: 767px)": {
                flexDirection: "column",
                pl: "5vw",
              },
            }}
          >
            <Typography variant={"h6"} sx={{ mt: "3vh" }}>
              {t("technologyHeader")}
            </Typography>
            <Typography variant={"body1"} sx={{ mt: "3vh" }}>
              {t.rich("technologyBody")}
            </Typography>
          </Box>
        </Container>

        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "25%",
            "@media (max-width: 767px)": {
              flexDirection: "row",
              justifyContent: "space-between",
              mx: 0,
              py: "5vh",
              width: "auto",
            },
          }}
        >
          <TranslateIcon sx={{ width: "100px", height: "100px" }} />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              "@media (max-width: 767px)": {
                flexDirection: "column",
                pl: "5vw",
              },
            }}
          >
            <Typography variant={"h6"} sx={{ mt: "3vh" }}>
              {t("languageHeader")}
            </Typography>
            <Typography variant={"body1"} sx={{ mt: "3vh" }}>
              {t.rich("languageBody")}
            </Typography>
          </Box>
        </Container>

        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "25%",
            "@media (max-width: 767px)": {
              flexDirection: "row",
              justifyContent: "space-between",
              mx: 0,
              py: "5vh",
              width: "auto",
            },
          }}
        >
          <Box
            sx={{
              w: "100px",
              h: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DownloadFileIcon />
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              "@media (max-width: 767px)": {
                flexDirection: "column",
                pl: "5vw",
              },
            }}
          >
            <Typography variant={"h6"} sx={{ mt: "3vh" }}>
              {t("downloadHeader")}
            </Typography>
            <Typography variant={"body1"} sx={{ mt: "3vh" }}>
              {t.rich("downloadBody")}
            </Typography>
          </Box>
        </Container>
      </Container>
    </Container>
  );
}
