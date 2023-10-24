import Layout from "@/components/layout";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { Analytics } from "@vercel/analytics/react";
import "mapbox-gl/dist/mapbox-gl.css";
import "../styles/globals.css";
import Head from "next/head";

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
      <Head>
        <title>MusicalBasics Concerts</title>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta
          name="description"
          content="MusicalBasics / We Are One concerts and events app."
        />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </ThemeProvider>
  );
}
