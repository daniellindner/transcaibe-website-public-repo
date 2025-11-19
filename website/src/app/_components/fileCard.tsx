import * as React from "react";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { FileToTranscribe } from "@/app/_components/FileToTranscribeType";
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CircularProgress,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { CloudDownload } from "@mui/icons-material";
import {
  DownloadFileType,
  startDownload,
} from "@/app/_utils/fileHandling/index.js";
import { getPriceForDuration } from "@/app/_utils/priceCalc/index.js";
import { TranscriptionStatus } from "@prisma/client";
import { useTranslations } from "next-intl";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import InsertDriveFileOutlined from "@mui/icons-material/InsertDriveFileOutlined";
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import EuroOutlined from "@mui/icons-material/EuroOutlined";
import Tooltip from "@mui/material/Tooltip";

function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

const FileCard = ({
  file,
  cart,
  updateCart,
  paymentCompleted,
  paypalOrderID,
}: {
  file: FileToTranscribe;
  cart: FileToTranscribe[];
  updateCart: React.Dispatch<React.SetStateAction<FileToTranscribe[]>>;
  paymentCompleted: boolean;
  paypalOrderID: string;
}) => {
  const [transcriptionStatus, setTranscriptionStatus] =
    React.useState<string>("");
  const [transcriptionStatusLoading, setTranscriptionStatusLoading] =
    React.useState<boolean>(true);
  const deleteRowFromCart = (fileToDelete: FileToTranscribe) => {
    const newCart = cart.filter(
      (cartEntry: FileToTranscribe) =>
        cartEntry.filehash !== fileToDelete.filehash,
    );
    updateCart(newCart);
  };

  // Download menu state
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Translation
  const t = useTranslations("TranscribeApp.fileCard");
  // function to check if the file has been transcribed yet
  const checkTranscriptionStatus = async () => {
    if (!paypalOrderID || paypalOrderID == "UNKNOWN") {
      return;
    }
    if (
      transcriptionStatus == TranscriptionStatus.COMPLETED ||
      transcriptionStatus == TranscriptionStatus.FAILED
    ) {
      return;
    }

    fetch(
      "/api/getFileTranscriptionStatus?" +
        new URLSearchParams({
          filehash: file.filehash,
          orderID: paypalOrderID,
        }),
      {
        method: "GET",
      },
    )
      .then((response) => response.json())
      .then((response) => {
        console.log("getFileTranscriptionStatus response: ", response);
        setTranscriptionStatus(response.transcriptionStatus || "UNKNOWN");
        setTranscriptionStatusLoading(false);
      });
  };

  // call the function to check if the file has been transcribed yet until it has been transcribed
  // call every 1 seconds
  React.useEffect(() => {
    // stop checking when the file has been transcribed or failed

    const interval = setInterval(() => {
      if (
        !(
          transcriptionStatus == TranscriptionStatus.COMPLETED ||
          transcriptionStatus == TranscriptionStatus.FAILED
        )
      ) {
        // old check when the file has not already been transcribed
        checkTranscriptionStatus();
      }
    }, 2_000);
    return () => clearInterval(interval);
  }, [paypalOrderID, transcriptionStatus]);

  // check the transcription status once on page load
  React.useEffect(() => {
    checkTranscriptionStatus();
  }, []);

  return (
    <Card
      variant="outlined"
      sx={{ maxWidth: 360, bgcolor: "background.paper" }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack
          direction="column"
          justifyContent="space-between"
          alignItems="left"
        >
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            color={"primary.main"}
          >
            {file.filename}
          </Typography>
          {/*    insert an audio player that previews the file here*/}
          {file.filesize && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title={t("fileSize")}>
                <InsertDriveFileOutlined
                  aria-label={t("fileSize")}
                  fontSize="small"
                  color="primary"
                />
              </Tooltip>
              <Typography variant="body2" color="primary.main">
                {(file.filesize / 1000 / 1000).toFixed(1)} MB
              </Typography>
            </Stack>
          )}
          {typeof file.playbackSeconds === "number" && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title={t("fileLength")}>
                <TimerOutlined
                  aria-label={t("fileLength")}
                  fontSize="small"
                  color="primary"
                />
              </Tooltip>
              <Typography variant="body2" color="primary.main">
                {formatDuration(file.playbackSeconds)}
              </Typography>
            </Stack>
          )}
          {typeof file.playbackSeconds === "number" && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title={t("price")}>
                <EuroOutlined
                  aria-label={t("price")}
                  fontSize="small"
                  color="primary"
                />
              </Tooltip>
              <Typography variant="body2" color="primary.main">
                {getPriceForDuration(file.playbackSeconds).toFixed(2)} EUR
              </Typography>
            </Stack>
          )}
          {/* Show transcription status if available */}
          {paypalOrderID && !transcriptionStatusLoading && (
            <Typography variant="body2" color="primary.main">
              {t("transcriptionStatus")} {transcriptionStatus}{" "}
              {transcriptionStatus != TranscriptionStatus.COMPLETED && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: 1,
                    marginRight: 1,
                  }}
                >
                  <CircularProgress size={10} />
                </Box>
              )}
            </Typography>
          )}
          {/* Show transcription status spinner if API response is still loading */}
          {paypalOrderID && transcriptionStatusLoading && (
            <Stack
              direction={"row"}
              justifyContent={"flex-start"}
              alignItems={"center"}
            >
              <Typography variant="body2" color="primary.main.light">
                Transcription Status:
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", marginLeft: 1 }}
              >
                <CircularProgress size={10} />
              </Box>
            </Stack>
          )}
        </Stack>
      </CardContent>
      <Divider light />
      <CardActions>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"flex-end"}
        >
          {paymentCompleted && (
            <React.Fragment>
              <Button
                sx={{
                  color: "background.paper",
                  bgcolor: "primary.main",
                  "&:hover": {
                    color: "primary.main",
                    bgcolor: "background.default",
                  },
                }}
                aria-label="download"
                onClick={handleClick}
                variant="contained"
                disabled={transcriptionStatus != TranscriptionStatus.COMPLETED}
                endIcon={<KeyboardArrowDownIcon />}

                // hidden={!paymentCompleted}
              >
                <CloudDownload sx={{ marginRight: 1 }} />
                {t("downloadFile")}
              </Button>
              <Menu
                id="fade-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{
                  "& .MuiPaper-root": {
                    // Targeting the MUI Paper component inside the Menu
                    backgroundColor: "background.paper", // Applying the theme's background.paper color
                  },
                }}
                // TransitionComponent={Fade}
              >
                <MenuItem
                  onClick={() => {
                    startDownload(file, paypalOrderID, DownloadFileType.TXT);
                    handleClose();
                  }}
                >
                  TXT File (.txt)
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    startDownload(file, paypalOrderID, DownloadFileType.WORD);
                    handleClose();
                  }}
                >
                  Word File (.docx)
                </MenuItem>
              </Menu>
            </React.Fragment>
          )}
          {!paymentCompleted && (
            <Button
              variant="contained"
              sx={{ color: "background.paper", bgcolor: "primary.main" }}
              aria-label="delete"
              onClick={() => {
                deleteRowFromCart(file);
              }}
              disabled={paymentCompleted}
              hidden={paymentCompleted}
            >
              <ClearIcon /> Delete
            </Button>
          )}
        </Stack>
      </CardActions>
      <Divider light />
    </Card>
  );
};

export default FileCard;
