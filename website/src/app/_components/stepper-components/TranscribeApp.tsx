"use client";

import Typography from "@mui/material/Typography";
import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Step,
  StepButton,
  Stepper,
} from "@mui/material";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import Dropzone from "react-dropzone";
import { FileToTranscribe } from "@/app/_components/FileToTranscribeType";
import {
  checkValidFileExtension,
  downloadInvoice,
  getAudioPlayTime,
  handlePreSignedPostUploadOfFiles,
  hashFile,
} from "@/app/_utils/fileHandling/index.js";
import { useRouter, useSearchParams } from "next/navigation";
import PayPalBox from "@/app/_components/paypalBox";
import FileCard from "@/app/_components/fileCard";
import { getTotalPriceForCart } from "@/app/_utils/priceCalc/index.js";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useTranslations } from "next-intl";
import { v4 as uuidv4 } from "uuid";

const paypalInitialOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string,
  currency: "EUR",
  intent: "capture",
};

function estimatePrice(cart: FileToTranscribe[]) {
  // for each file, get the playbackSeconds, and multiply by the cost per second
  return getTotalPriceForCart(cart);
}

function TranscribeApp() {
  // a component that handles the client side of the transcription app ^^
  // we use a MUI Stepper component to guide the user through the transcription process
  const [activeStep, setActiveStep] = React.useState(0);
  const [cart, setCart] = React.useState<FileToTranscribe[]>([]);
  const [paypalOrderStatus, setPaypalOrderStatus] = React.useState("UNKNOWN");
  const [paypalOrderID, setPaypalOrderID] = React.useState("");
  const searchParams = useSearchParams();
  const [message, setMessage] = React.useState("");
  const [estimatedPrice, setEstimatedPrice] = React.useState(0);
  const [freezeState, setFreezeState] = React.useState(false); // use this after payment to prevent further changes to the cart
  const [orderInfoLoading, setOrderInfoLoading] = React.useState(false);
  const [sessionId, setSessionId] = React.useState(uuidv4()); // this is the session ID for the user, used for analytics, initiate as random string

  const router = useRouter();

  const t = useTranslations("TranscribeApp");

  const steps = [
    { callToAction: t("instructions.step1") },
    { callToAction: t("instructions.step2") },
    { callToAction: t("instructions.step3") },
  ];

  // logic to track when a user inserts a file into the cart
  React.useEffect(() => {
    // send an event to the analytics API route
    // send POST request to /api/analytics with the event name "file_inserted" and the quantity of files inserted
    if (cart.length === 0) {
      return;
    }
    fetch("/api/analytics", {
      method: "POST",
      body: JSON.stringify({
        sessionId: sessionId,
        event_name: "file_inserted",
        quantity: cart.length,
      }),
    })
      .then((response) => response.json() || {})
      .then((response) => {
        //console.log("response from analytics API", response)
      });
  }, [cart]);

  // logic to track when a users reaches activeStep 1
  React.useEffect(() => {
    if (activeStep === 1) {
      // send an event to the analytics API route
      // send POST request to /api/analytics with the event name "payment_started" and the quantity of files inserted
      fetch("/api/analytics", {
        method: "POST",
        body: JSON.stringify({
          sessionId: sessionId,
          event_name: "payment_step_opened_with_x_files",
          quantity: cart.length,
        }),
      })
        .then((response) => response.json() || {})
        .then((response) => {
          //console.log("response from analytics API", response)
        });
    }
  }, [activeStep]);

  // logic to handle paymentState and Upload of files after payment

  // update price preview estimate when cart changes
  React.useEffect(() => {
    setEstimatedPrice(estimatePrice(cart));
  }, [cart]);

  // debug function to log the cart to console
  React.useEffect(() => {
    console.log("paypalOrderStatus", paypalOrderStatus);
  }, [paypalOrderStatus]);

  // freeze the cart after payment, so that no more files can be added
  // will also freeze the cart if the page was opened with an orderID in the URL -> page opened for a past and already paid for order
  React.useEffect(() => {
    if (
      paypalOrderStatus === "COMPLETED" ||
      paypalOrderStatus === "PAST_ORDER_GET_DATA_FROM_SERVER"
    ) {
      setFreezeState(true);
    } else {
      setFreezeState(false);
    }
    // console.log("freezeState", freezeState)
  }, [paypalOrderStatus]);

  // handle the file upload directly after payment
  React.useEffect(() => {
    if (paypalOrderStatus === "COMPLETED" && paypalOrderID !== "") {
      // completed payment and orderID is known -> order was just completed, time to upload files to S3
      router.push(`/?id=${paypalOrderID}`);

      // set a cookie with the orderID for 48 hours
      document.cookie = `lastOrder=${paypalOrderID}; max-age=172800; path=/`;

      // initiate the download of audio files to S3
      // get presigned URLS for each file
      // upload each file to S3
      handlePreSignedPostUploadOfFiles(paypalOrderID, cart)
        .then(() => {
          console.log("uploaded files to S3");
        })
        .catch((error) => {
          console.log("error uploading files to S3", error);
        });
    }
  }, [paypalOrderStatus]);

  // automatically show the download page after payment
  React.useEffect(() => {
    if (
      ["COMPLETED", "PAST_ORDER_GET_DATA_FROM_SERVER"].includes(
        paypalOrderStatus,
      )
    ) {
      setActiveStep(2);
    }
  }, [paypalOrderStatus, activeStep]);

  // handle the case where the page was opened with an orderID in the URL
  // this happens when the user opens the page with a link (on same or different device)
  // or when the user refreshes the page
  React.useEffect(() => {
    if (searchParams.get("id") !== null && paypalOrderStatus === "UNKNOWN") {
      // page was opened with an orderID in the URL, but payment status is unknown
      // -> this happens after a page refresh or when opening the page with a link (on same or different device)
      // get the order status from the server
      setOrderInfoLoading(true);
      setPaypalOrderStatus("PAST_ORDER_GET_DATA_FROM_SERVER");
      setActiveStep(2);
      try {
        fetch(
          "/api/getOrderInfoById?" +
            new URLSearchParams({
              orderID: searchParams.get("id") as string,
            }),
          {
            method: "GET",
          },
        )
          .then((response) => response.json() || {})
          .then((response) => {
            console.log("order info from server: \n", response);
            if (!response.files) {
              // no files were found for this orderID
              // -> this happens when the orderID is invalid or the order was already completed
              // -> redirect to homepage
              router.push("/");
              setMessage(
                "Order ID expired or invalid. Orders are automatically deleted after 48 hours. Please reload the page.",
              );
              setPaypalOrderID("UNKNOWN");
            } else {
              setPaypalOrderID(response.paypalOrderId);
              setCart(response.files);
            }
            setOrderInfoLoading(false);
          });
      } catch (error) {
        console.log("error getting order info from server", error);
      }
    }
  }, [paypalOrderStatus, searchParams]);

  // lock in step 2 if payment is completed
  React.useEffect(() => {
    if (paypalOrderStatus === "COMPLETED") {
      setActiveStep(2);
    }
  }, [paypalOrderStatus, activeStep]);

  const handleNext = () => {
    console.log("activeStep", activeStep);
    const nextStep = Math.min(activeStep + 1, 1);
    console.log("nextStep", nextStep);
    setActiveStep(nextStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step: number) => () => {
    if (!freezeState && [0, 1].includes(step)) {
      setActiveStep(step);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    // limit the number of files in the cart to 20
    console.log("cart.length", cart.length);
    const max_files = 20;
    if (cart.length + acceptedFiles.length > max_files) {
      setMessage(
        `Maximum amount of files (${max_files}) reached. Please complete your order and start a new one.`,
      );

      // only add the first 20 files to the cart
      if (cart.length >= max_files) {
        // cart is already full, do nothing
        return;
      }
      // add the first n files to the cart
      acceptedFiles = acceptedFiles.slice(0, max_files - cart.length);
    }

    const existingHashes = new Set(cart.map((row) => row.filehash));
    const fileCheckPromises = acceptedFiles.map(async (file) => {
      // file hashes
      const hash = await hashFile(file);
      if (!existingHashes.has(hash) && checkValidFileExtension(file)) {
        existingHashes.add(hash);

        return {
          filename: file.name,
          filesize: file.size,
          filehash: hash,
          playbackSeconds: await getAudioPlayTime(file),
          file: file,
        };
      }
      return null;
    });

    const newRows = (await Promise.all(fileCheckPromises)).filter(
      (row): row is FileToTranscribe => row !== null,
    ); // This line filters out null values

    setCart([...cart, ...newRows]);
  };

  const uploadComponent = () => {
    return (
      // Upload your audio files
      <Container
        sx={{
          mt: 2,
          mb: 1,
          py: 1,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Dropzone onDrop={(acceptedFiles) => onDrop(acceptedFiles)} noClick>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              {/*if cart is empty show call to action to upload a file */}
              {cart.length === 0 && (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minHeight={"20vh"}
                  minWidth={"80vw"}
                  height={"100%"}
                  bgcolor={"background.paper"}
                  borderRadius={5}
                >
                  <Dropzone onDrop={(acceptedFiles) => onDrop(acceptedFiles)}>
                    {({ getRootProps, getInputProps }) => (
                      <div {...getRootProps()}>
                        <input {...getInputProps()} />
                        <Typography
                          color="primary.main"
                          variant="h6"
                          align={"center"}
                        >
                          {t("drag&drop.uploadContainer")}
                        </Typography>
                      </div>
                    )}
                  </Dropzone>
                </Box>
              )}
              {/*If cart contains items, show items in a grid of fileCards */}
              {cart.length > 0 && (
                <Grid container spacing={2}>
                  {cart.map((row) => {
                    return (
                      <Grid key={row.filehash}>
                        <FileCard
                          file={row}
                          cart={cart}
                          updateCart={setCart}
                          paymentCompleted={paypalOrderStatus === "COMPLETED"}
                          paypalOrderID={paypalOrderID}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </div>
          )}
        </Dropzone>
        <Dropzone onDrop={(acceptedFiles) => onDrop(acceptedFiles)}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Button
                variant="contained"
                aria-label="upload file"
                sx={{
                  bgcolor: "secondary.main",
                  color: "primary.main",
                  minWidth: "30vw",
                  maxWidth: "40vw",
                  mt: 2,
                  mb: 1,
                  py: 1,
                  borderRadius: 5,
                  "&:hover": {
                    color: "primary.main",
                    backgroundColor: "secondary.light",
                  },
                }}
              >
                <UploadFileIcon sx={{ color: "primary.main" }} />
                <Typography sx={{ color: "primary.main" }}>
                  {t("drag&drop.uploadButton")}
                </Typography>
              </Button>
            </div>
          )}
        </Dropzone>
      </Container>
    );
  };
  const payComponent = () => {
    return (
      // Pay with PayPal
      <Container sx={{ mt: 2, mb: 1, py: 1 }}>
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={"column"}
        >
          <PayPalBox
            cart={cart}
            setPaypalOrderStatus={setPaypalOrderStatus}
            setPaypalOrderID={setPaypalOrderID}
          />
        </Box>
      </Container>
    );
  };
  const downloadComponent = () => {
    return (
      // Download your transcriptions
      <Container id={"downloadContainer"} sx={{ mt: 2, mb: 1, py: 1, px: 0 }}>
        {/*if cart is empty, something went wrong */}
        {cart.length === 0 && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="20vh"
            height={"100%"}
            bgcolor={"lightgrey"}
          >
            {
              // display loading indicator if order info is loading
              orderInfoLoading && <CircularProgress />
            }
            {
              // display message if order info is loaded and no files were found
              !orderInfoLoading && (
                <Typography variant="h6">
                  Order ID expired or invalid. Orders are automatically deleted
                  after 48 hours. Please reload the page.
                </Typography>
              )
            }
          </Box>
        )}
        {/*If cart contains items, show items in a grid of fileCards */}
        {cart.length > 0 && (
          <Grid container spacing={2}>
            {cart.map((row) => {
              return (
                <Grid key={row.filehash}>
                  <FileCard
                    file={row}
                    cart={cart}
                    updateCart={setCart}
                    paymentCompleted={[
                      "COMPLETED",
                      "PAST_ORDER_GET_DATA_FROM_SERVER",
                    ].includes(paypalOrderStatus)}
                    paypalOrderID={paypalOrderID}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}

        {cart.length > 0 && (
          <Box
            display="flex"
            justifyContent="flex-end" // This aligns the button to the right
            sx={{ mt: 2, mb: 1, py: 1 }}
          >
            <Button
              variant="contained"
              sx={{
                bgcolor: "background.default",
                color: "primary.main",
                "&:hover": {
                  color: "background.default",
                  backgroundColor: "primary.dark",
                },
              }}
              onClick={() => {
                downloadInvoice(paypalOrderID);
              }}
            >
              {t("downloadInvoice")}
            </Button>
          </Box>
        )}
      </Container>
    );
  };

  return (
    <PayPalScriptProvider options={paypalInitialOptions}>
      <Container
        sx={{ display: "flex", marginTop: 1, justifyContent: "center" }}
      >
        <Box
          id="bottomBox"
          sx={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            minWidth: "80vw",
            pl: "16px",
          }}
        >
          <Stepper
            nonLinear
            activeStep={activeStep}
            sx={{
              "& .MuiStepIcon-root": { color: "background.paper" },
              // Target the active state specifically
              "& .MuiStepIcon-root.Mui-active": {
                color: "secondary.main",
              },
              "& .MuiStepIcon-text": { fill: "#101f39" }, // Here accessing the theme does not work
            }}
          >
            {steps.map((stepDef, index) => (
              <Step key={stepDef.callToAction}>
                <StepButton onClick={handleStep(index)}>
                  <Typography color="background.paper">
                    {stepDef.callToAction}
                  </Typography>
                </StepButton>
              </Step>
            ))}
          </Stepper>
          <div>
            {/* render the current content based on the selected step */}
            {activeStep === 0 && uploadComponent()}
            {activeStep === 1 && payComponent()}
            {activeStep === 2 && downloadComponent()}

            {/* Always show button box, independent of step */}

            {cart.length > 0 && !freezeState && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  pt: 2,
                  justifyContent: "center",
                }}
              >
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{
                    ml: 0,
                    backgroundColor:
                      activeStep === 0 ? "grey.300" : "background.paper", // Example disabled bg color
                    color: activeStep === 0 ? "grey.500" : "primary.main", // Change text color to make it visible
                    "&:hover": {
                      backgroundColor: "primary.dark", // Lighten on hover for enabled state
                      color: "background.paper", // Disabled text color, if you want to customize
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "grey.300", // Disabled bg color, if you want to customize
                      color: "grey.500", // Disabled text color, if you want to customize
                    },
                  }}
                  variant={"contained"}
                >
                  {t("buttons.backward")}
                </Button>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button
                  onClick={handleNext}
                  sx={{
                    mr: 0,
                    backgroundColor:
                      activeStep === 0 ? "secondary.main" : "background.paper", // Example disabled bg color
                    color: activeStep === 0 ? "primary.main" : "primary.main", // Change text color to make it visible
                    "&:hover": {
                      backgroundColor:
                        activeStep === 0 ? "primary.dark" : "primary.dark", // Lighten on hover for enabled state
                      color: "secondary.main", // Disabled text color, if you want to customize
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "grey.300", // Disabled bg color, if you want to customize
                      color: "grey.500", // Disabled text color, if you want to customize
                    },
                  }}
                  variant={"contained"}
                  disabled={activeStep != 0}
                >
                  {t("buttons.forward")}
                </Button>
              </Box>
            )}

            {/*// show price estimate*/}
            {cart.length > 0 && (
              <Typography
                variant="h6"
                align={"right"}
                sx={{ pt: 2, color: "background.paper" }}
              >
                {t("priceEstimate")}: {estimatedPrice.toFixed(2)} EUR
              </Typography>
            )}
          </div>
        </Box>
        <Snackbar
          open={message.length > 0}
          autoHideDuration={10_000}
          onClose={() => {
            setMessage("");
          }}
          message={message}
        />
      </Container>
    </PayPalScriptProvider>
  );
}

export default TranscribeApp;
