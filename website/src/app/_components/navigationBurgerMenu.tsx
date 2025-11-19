"use client";

import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "@mui/material";
import { useTranslations } from "next-intl";
import Stack from "@mui/material/Stack";
import LocaleSwitch from "@/app/_components/LocaleSwitch";

function NavigationBurgerMenu() {
  const t = useTranslations("LogoTopAppBar");

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null,
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <React.Fragment>
      <Box sx={{ display: { xs: "flex", md: "none" } }}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleOpenNavMenu}
          color="inherit"
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorElNav}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          open={Boolean(anchorElNav)}
          onClose={handleCloseNavMenu}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiPaper-root": {
              // Targeting the MUI Paper component inside the Menu
              backgroundColor: "background.default", // Applying the theme's background.paper color
            },
          }}
        >
          <MenuItem onClick={handleCloseNavMenu}>
            <Link
              color="inherit"
              href={"#howToUse"}
              variant={"body1"}
              underline={"none"}
              style={{ fontWeight: "bold" }}
            >
              {t("HowToUse")}
            </Link>
          </MenuItem>
          <MenuItem onClick={handleCloseNavMenu}>
            <Link
              color="inherit"
              href={"#pricing"}
              variant={"body1"}
              underline={"none"}
              style={{ fontWeight: "bold" }}
            >
              {t("Pricing")}
            </Link>
          </MenuItem>
          <MenuItem onClick={handleCloseNavMenu}>
            <Link
              color="inherit"
              href={"#privacy"}
              variant={"body1"}
              underline={"none"}
              style={{ fontWeight: "bold" }}
            >
              {t("Privacy")}
            </Link>
          </MenuItem>
          <MenuItem onClick={handleCloseNavMenu}>
            <Link
              color="inherit"
              href={"#faq"}
              variant={"body1"}
              underline={"none"}
              style={{ fontWeight: "bold" }}
            >
              FAQs
            </Link>
          </MenuItem>
          <MenuItem
            onClick={handleCloseNavMenu}
            style={{
              display: "flex",
              alignItems: "center",
              maxHeight: "48px",
              paddingLeft: "10px",
            }}
          >
            <LocaleSwitch />
          </MenuItem>
        </Menu>
      </Box>

      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          direction={"row"}
          spacing={8}
          sx={{ alignItems: "center", justifyContent: "center" }}
        >
          <Link
            color="inherit"
            href={"#howToUse"}
            variant={"body1"}
            underline={"none"}
            style={{ fontWeight: "bold" }}
          >
            {t("HowToUse")}
          </Link>
          <Link
            color="inherit"
            href={"#pricing"}
            variant={"body1"}
            underline={"none"}
            style={{ fontWeight: "bold" }}
          >
            {t("Pricing")}
          </Link>
          <Link
            color="inherit"
            href={"#privacy"}
            variant={"body1"}
            underline={"none"}
            style={{ fontWeight: "bold" }}
          >
            {t("Privacy")}
          </Link>
          <Link
            color="inherit"
            href={"#faq"}
            variant={"body1"}
            underline={"none"}
            style={{ fontWeight: "bold" }}
          >
            FAQs
          </Link>
          <LocaleSwitch />
        </Stack>
      </Box>
    </React.Fragment>
  );
}

export default NavigationBurgerMenu;
