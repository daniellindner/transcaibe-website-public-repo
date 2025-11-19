// components/LanguageList.tsx
"use client";
import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  Container,
  ListItemText,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import TranslateIcon from "@mui/icons-material/Translate";
import { localeCountryCode, localeLabels, locales } from "@/navigation";
import { FlagIcon } from "react-flag-kit";
import { useTranslations } from "next-intl";

const LanguageList: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const t = useTranslations("Footer");

  return (
    <div>
      <Button
        variant="outlined"
        onClick={handleClickOpen}
        startIcon={<TranslateIcon />}
      >
        {t("availableLanguages")}
      </Button>
      <Dialog
        onClose={handleClose}
        aria-labelledby="language-list-dialog-title"
        open={open}
      >
        <DialogTitle id="language-list-dialog-title">
          {t("availableLanguages")}
        </DialogTitle>
        <Grid container spacing={2} sx={{ py: "5vh" }}>
          {locales.map((locale) => (
            <Grid
              item
              component="a"
              href={`/${locale}`}
              key={locale}
              onClick={handleClose}
              xs={4}
            >
              <Container
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <FlagIcon code={localeCountryCode[locale]} />
                <ListItemText
                  primary={localeLabels[locale]}
                  sx={{ px: "5px" }}
                />
              </Container>
            </Grid>
          ))}
        </Grid>
      </Dialog>
    </div>
  );
};

export default LanguageList;
