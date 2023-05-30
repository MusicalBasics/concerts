import Footer from "@/components/footer";
import { Inter } from "next/font/google";
import ResponsiveAppBar from "./app-bar";
import { Container, ThemeProvider, createTheme } from "@mui/material";

const inter = Inter({ subsets: ["latin"] });

const theme = createTheme({
  palette: {
    primary: {
      main: "#232323",
    },
    secondary: {
      main: "#ffffff",
    },
    text: {
      primary: "#ffffff",
    },
  },
});

export default function Layout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <ResponsiveAppBar />
      <Container
        className={inter.className}
        sx={{
          color: "white",
        }}
      >
        {children}
      </Container>
      <Footer />
    </ThemeProvider>
  );
}
