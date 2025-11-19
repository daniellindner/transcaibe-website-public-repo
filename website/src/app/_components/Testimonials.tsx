// This component is a container that contains 3 testimonals of costumers.

import React from "react";
import Container from "@mui/material/Container";
import { Avatar, Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useTranslations } from "next-intl";

export default function Testimonials() {
  const t = useTranslations("Testimonials");

  return (
    <Container
      maxWidth={false}
      id={"testimonials"}
      sx={{
        mt: "10vh",
        py: "10vh",
        width: "100vw",
        bgcolor: "grey.500",
        flexGrow: 1,
      }}
    >
      <Container
        id={"testimonialsContainer"}
        disableGutters={true}
        sx={{
          display: "flex",
          flexDirection: "row", // Default direction
          justifyContent: "space-between",
          alignItems: "center",
          "@media (max-width: 767px)": {
            // Apply for screens smaller than 768px
            flexDirection: "column", // Change flexDirection to column for small screens
          },
        }}
      >
        {/*Here Should be three boxes now that contain the testimonial text*/}

        <Box
          sx={{
            width: "25%",
            height: "auto",
            my: "3vh",
            bgcolor: "background.default",
            borderRadius: 5,
            position: "relative", // Needed to position the flag icon absolutely within the Box
            padding: 2, // Add padding inside the Box for its content
            boxShadow: 3,
            "@media (max-width: 767px)": {
              // Apply for screens smaller than 768px
              width: "auto", // Change flexDirection to column for small screens
            },
          }}
        >
          {/* Circular icon with a Flag positioned in the top left corner */}
          <Avatar
            sx={{
              width: 48,
              height: 48, // Adjust size as needed
              position: "absolute",
              top: 24, // Adjust for desired positioning from the top
              left: 24, // Adjust for desired positioning from the left
              bgcolor: "primary.main", // Optional: change background color
            }}
            alt="Maggie Mannheim"
            src={"/notfound"}
          />

          <Typography variant={"body1"} sx={{ mt: 10 }}>
            {" "}
            {/* Adjust top margin to avoid overlap with the avatar */}
            {t("Testimonial1.testimonial")}
          </Typography>

          {/* Typography with the author's name */}
          <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
            {" "}
            {/* Adjust as needed */}
            {t("Testimonial1.author")}
          </Typography>
        </Box>

        <Box
          sx={{
            width: "33%",
            height: "auto",
            my: "3vh",
            bgcolor: "background.default",
            borderRadius: 5,
            position: "relative", // Needed to position the flag icon absolutely within the Box
            padding: 2, // Add padding inside the Box for its content
            boxShadow: 5,
            "@media (max-width: 767px)": {
              // Apply for screens smaller than 768px
              width: "auto", // Change flexDirection to column for small screens
            },
          }}
        >
          {/* Circular icon with a Flag positioned in the top left corner */}
          <Avatar
            sx={{
              width: 48,
              height: 48, // Adjust size as needed
              position: "absolute",
              top: 24, // Adjust for desired positioning from the top
              left: 24, // Adjust for desired positioning from the left
              bgcolor: "primary.main", // Optional: change background color
            }}
            alt="Lena Leiter"
            src={"/notfound"}
          />

          <Typography variant={"body1"} sx={{ mt: 10 }}>
            {" "}
            {/* Adjust top margin to avoid overlap with the avatar */}
            {t("Testimonial2.testimonial")}
          </Typography>

          {/* Typography with the author's name */}
          <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
            {" "}
            {/* Adjust as needed */}
            {t("Testimonial2.author")}
          </Typography>
        </Box>

        <Box
          sx={{
            width: "25%",
            height: "auto",
            my: "3vh",
            bgcolor: "background.default",
            borderRadius: 5,
            position: "relative", // Needed to position the flag icon absolutely within the Box
            padding: 2, // Add padding inside the Box for its content
            boxShadow: 3,
            "@media (max-width: 767px)": {
              // Apply for screens smaller than 768px
              width: "auto", // Change flexDirection to column for small screens
            },
          }}
        >
          {/* Circular icon with a Flag positioned in the top left corner */}
          <Avatar
            sx={{
              width: 48,
              height: 48, // Adjust size as needed
              position: "absolute",
              top: 24, // Adjust for desired positioning from the top
              left: 24, // Adjust for desired positioning from the left
              bgcolor: "primary.main", // Optional: change background color
            }}
            alt="Tom Taube"
            src={"/notfound"}
          />

          <Typography variant={"body1"} sx={{ mt: 10 }}>
            {" "}
            {/* Adjust top margin to avoid overlap with the avatar */}
            {t("Testimonial3.testimonial")}
          </Typography>

          {/* Typography with the author's name */}
          <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
            {" "}
            {/* Adjust as needed */}
            {t("Testimonial3.author")}
          </Typography>
        </Box>
      </Container>
    </Container>
  );
}
