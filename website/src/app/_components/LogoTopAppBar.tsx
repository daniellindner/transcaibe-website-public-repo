import * as React from "react";
import { AppBar, Box, Toolbar } from "@mui/material";
import transcrAIbeLogoSVG from "@/app/_components/SVG_Components/transcrAIbeLogoSVG";
import NavigationBurgerMenu from "@/app/_components/navigationBurgerMenu";

export default function LogoTopAppBar() {
  return (
    <AppBar
      position="sticky"
      color="primary"
      sx={{ height: 64, width: "100vw", boxShadow: 0 }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo on the left */}
        <a href={"/"}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {transcrAIbeLogoSVG()}
          </Box>
        </a>

        <NavigationBurgerMenu />
      </Toolbar>
    </AppBar>
  );
}
