import React from "react";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useTranslations } from "next-intl";
import styles from "./ShadowBox.module.css";
import { Box } from "@mui/material"; // Assuming you are using CSS modules

export default function Pricing() {
  const t = useTranslations("Pricing");
  return (
    <Container id={"pricing"}>
      <Container
        id={"pricingContainer"}
        disableGutters={true}
        sx={{
          my: "10vh",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "66vw",
            pr: "13px",
          }}
        >
          <Typography variant={"h3"}>{t("title")}</Typography>
          <Typography variant="h5" gutterBottom sx={{ pt: "1vh" }}>
            {t("subtitle")}
          </Typography>

          <Typography variant="body1" sx={{ pt: "3vh" }}>
            {t.rich("content")}
          </Typography>

          <Typography variant="body1" style={{ marginTop: "16px" }}>
            {t.rich("note")}
          </Typography>
        </Box>

        <div className={styles.shadowBoxWrapper}>
          <div className={styles.shadowBox}>
            <Container
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
              }}
            >
              <Typography variant="h1">2,99</Typography>

              <Typography variant={"subtitle1"} align={"center"}>
                {t("pricePerHour")}
              </Typography>
            </Container>
          </div>
        </div>
      </Container>

      <TableContainer
        component={Paper}
        style={{ marginTop: "16px", marginBottom: "16px" }}
        sx={{ bgcolor: "background.default", boxShadow: 3 }}
      >
        <Table aria-label="pricing table">
          <TableHead>
            <TableRow>
              <TableCell>{t("pricingTable.row1.ele1")}</TableCell>
              <TableCell align="right">{t("pricingTable.row1.ele2")}</TableCell>
              <TableCell align="right">{t("pricingTable.row1.ele3")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{t("pricingTable.row2.ele1")}</TableCell>
              <TableCell align="right">{t("pricingTable.row2.ele2")}</TableCell>
              <TableCell align="right">{t("pricingTable.row2.ele3")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>{t("pricingTable.row3.ele1")}</TableCell>
              <TableCell align="right">{t("pricingTable.row3.ele2")}</TableCell>
              <TableCell align="right">{t("pricingTable.row3.ele3")}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
