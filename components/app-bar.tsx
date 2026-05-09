// Import statements remain the same
import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import * as React from "react";
import Logo from "./logo";

// Typing for pages array
type Page = {
  name: string;
  link: string;
  newTab: boolean;
};

const pages: Page[] = [
  { name: "Home", link: "/", newTab: false },
  { name: "Request a Show", link: "/request-a-show", newTab: false },
  { name: "Host a Show", link: "/host-a-show", newTab: false },
  { name: "Main Site", link: "https://musicalbasics.com", newTab: true },
  {
    name: "How It Works",
    link: "https://musicalbasics.com/pages/golden-tickets",
    newTab: true,
  },
  {
    name: "We Are One",
    link: "https://www.youtube.com/@WeAreOnePiano",
    newTab: true,
  },
];

const ResponsiveAppBar: React.FC = () => {
  const [anchorElNav, setAnchorElNav] = React.useState<HTMLElement | null>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      position="static"
      color="transparent"
      sx={{
        boxShadow: "none",
        borderBottom: "none",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile */}
          <Typography
            variant="h6"
            noWrap
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Link href="/">
              <Logo />
            </Link>
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
            }}
          >
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon color="secondary" />
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
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center" color="black">
                    <Link
                      href={page.link}
                      target={page.newTab ? "_blank" : undefined}
                      rel={page.newTab ? "noopener noreferrer" : undefined}
                    >
                      {page.name}
                    </Link>
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Link href="/">
              <Logo />
            </Link>
          </Typography>
          {/* Desktop */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Link
                key={page.name}
                passHref
                href={page.link}
                target={page.newTab ? "_blank" : undefined}
                rel={page.newTab ? "noopener noreferrer" : undefined}
              >
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {page.name}
                </Button>
              </Link>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
