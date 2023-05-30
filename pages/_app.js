import Layout from "@/components/layout";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/globals.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#232323",
    },
    secondary: {
      main: "#ffffff",
    },
  },
});

export default function MyApp({ Component, pageProps }) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  return getLayout(
    <ThemeProvider theme={theme}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
