import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent,
} from "@mui/material";
import { FlagIcon } from "react-flag-kit";
import { useLocale } from "next-intl";
import Typography from "@mui/material/Typography";
import { Locale, localeCountryCode, locales } from "@/navigation";

export default function LanguageSelector() {
  const router = useRouter();
  const [locale, setLocale] = useState(useLocale() as string);
  const safeLocale = locales.includes(locale as Locale) ? locale : "en";

  const handleChange = (event: SelectChangeEvent) => {
    setLocale(event.target.value as string);
    router.push(`/${event.target.value as string}`);
  };

  return (
    <FormControl variant="standard" sx={{ m: 1 }}>
      <Select
        id="language-selector"
        value={locale}
        onChange={handleChange}
        renderValue={() => (
          <>
            <FlagIcon code={localeCountryCode[safeLocale as Locale]} />
          </>
        )}
        sx={{
          ".MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            color: "white", // Adjusts the text color
          },
          ".MuiSvgIcon-root": {
            color: "grey.500", // Adjusts the dropdown arrow color
          },
          bgcolor: "inherit", // Adjusts the background color of the select box
          "&:before": {
            // Removes the underline
            borderBottomColor: "transparent",
          },
          "&:hover:not(.Mui-disabled):before": {
            // Removes the underline on hover
            borderBottom: "none",
          },
        }}
      >
        <MenuItem value="en">
          <Typography
            sx={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            EN <FlagIcon code="US" />
          </Typography>
        </MenuItem>
        <MenuItem value="de">
          <Typography
            sx={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            DE <FlagIcon code="DE" />
          </Typography>
        </MenuItem>
        <MenuItem value="fr">
          <Typography
            sx={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            FR <FlagIcon code="FR" />
          </Typography>
        </MenuItem>
        <MenuItem value="es">
          <Typography
            sx={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            ES <FlagIcon code="ES" />
          </Typography>
        </MenuItem>
        <MenuItem value="it">
          <Typography
            sx={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            IT <FlagIcon code="IT" />
          </Typography>
        </MenuItem>
      </Select>
    </FormControl>
  );
}
