// This component contains the FAQ page
"use client";
import { useTranslations } from "next-intl";
import React, { ReactElement, ReactNode, useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Container from "@mui/material/Container";

// Simplified data structure for FAQs
// Adjusted to accept answer as string or ReactElement or ReactNodeArray
function createFAQData(question: string, answer: any) {
  return {
    question,
    answer,
  };
}
function renderAnswer(answer: any) {
  if (typeof answer === "string") {
    return answer;
  } else if (typeof answer === "object") {
    return (
      <>
        {answer.map((item: string, index: number) => (
          // Directly render strings and React elements from the array
          <React.Fragment key={index}>{item}</React.Fragment>
        ))}
      </>
    );
  }
}

// Row component adjusted for FAQs
// Updated props type to include the adjusted answer types
function FAQRow(props: {
  faq: { question: string; answer: string | ReactElement | ReactNode };
}) {
  const { faq } = props;
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow
        onClick={() => setOpen(!open)}
        sx={{
          cursor: "pointer",
          transition: "transform 0.4s ease, box-shadow 0.4s ease",
          "&:hover": {
            boxShadow: "0 0 0 2px #101f39 inset",
            transform: "scale(1.02)",
          },
        }}
      >
        <TableCell component="th" scope="row">
          <Typography variant={"h5"} sx={{ px: "24px" }}>
            {faq.question}
          </Typography>
        </TableCell>
        <TableCell sx={{ width: "30px", height: "30px" }}>
          <IconButton aria-label="expand row" size="large">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box>
              {/* Render answer depending on its type */}
              <Typography variant="body1" sx={{ p: "24px" }}>
                {renderAnswer(faq.answer)}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function FAQTable() {
  const t = useTranslations("FAQ");
  /*const faqs = [createFAQData(t('faq3.question'), t.rich('faq3.answer', {
        // Map 'br' to a self-closing <br /> tag for line breaks
        br: () => <br />,
    }))];*/
  const faqs = [
    createFAQData(
      t("faq1.question"),
      t.rich("faq1.answer", {
        br: () => <br />,
        audiosplitter: (chunks) => (
          <a
            href="https://products.aspose.app/audio/splitter"
            target="_blank"
            style={{ textDecoration: "underline", color: "blue" }}
          >
            {chunks}
          </a>
        ),
      }),
    ),
    createFAQData(
      t("faq2.question"),
      t.rich("faq2.answer", { br: () => <br /> }),
    ),
    createFAQData(
      t("faq3.question"),
      t.rich("faq3.answer", { br: () => <br /> }),
    ),
    createFAQData(
      t("faq4.question"),
      t.rich("faq4.answer", { br: () => <br /> }),
    ),
    createFAQData(
      t("faq5.question"),
      t.rich("faq5.answer", { br: () => <br /> }),
    ),
    createFAQData(
      t("faq6.question"),
      t.rich("faq6.answer", { br: () => <br /> }),
    ),
    createFAQData(
      t("faq7.question"),
      t.rich("faq7.answer", { br: () => <br /> }),
    ),
    createFAQData(
      t("faq8.question"),
      t.rich("faq8.answer", { br: () => <br /> }),
    ),
    createFAQData(
      t("faq9.question"),
      t.rich("faq9.answer", { br: () => <br /> }),
    ),
  ];

  return (
    <Container id={"faq"} sx={{ pt: "10vh" }}>
      <Typography variant={"h3"} sx={{ pt: "3vh" }}>
        {t("title")}
      </Typography>
      <Typography variant={"h5"} sx={{ pb: "3vh" }}>
        {t("subtitle")}
      </Typography>
      <TableContainer
        component={Paper}
        elevation={5}
        sx={{ borderRadius: "8px" }}
      >
        <Table aria-label="faq table">
          <TableBody>
            {faqs.map((faq, index) => (
              <FAQRow key={index} faq={faq} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
