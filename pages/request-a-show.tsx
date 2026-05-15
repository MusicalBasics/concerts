import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { FC, useState } from "react";

import ResponsiveAppBar from "@/components/app-bar";
import RootLayout from "@/components/root-layout";

interface RequestAShowProps {
  defaultCountry: string;
}

const RequestAShowPage: FC<RequestAShowProps> = ({ defaultCountry }) => {
  const [form, setForm] = useState({
    email: "",
    country: defaultCountry,
    city: "",
    website: "", // honeypot
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const update = (key: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/request-a-show", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          country: form.country,
          city: form.city,
          requester_type: "fan",
          website: form.website,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.error ||
            "Something went wrong signing you up. Please try again."
        );
      }

      setStatus("success");
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(
        error?.message ||
          "Something went wrong signing you up. Please try again."
      );
    }
  };

  return (
    <RootLayout>
      <Head>
        <title>Get Notified About Shows | MusicalBasics</title>
        <meta
          name="description"
          content="Sign up for Lionel Yu's email list and get notified the next time he's playing in your city."
        />
        <meta
          property="og:title"
          content="Get Notified About Shows | MusicalBasics"
        />
        <meta
          property="og:description"
          content="Hop on the list and hear about Lionel Yu's next concert in your city."
        />
        <meta
          property="og:image"
          content="/images/new-york-carnegie-zankel-hall.jpg"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://concerts.musicalbasics.com/request-a-show"
        />
      </Head>

      <Box
        sx={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(40,40,40,1) 100%)",
          color: "white",
          paddingBottom: { xs: 12, md: 16 },
        }}
      >
        <ResponsiveAppBar />

        <Container maxWidth="md" sx={{ paddingTop: { xs: 4, md: 8 } }}>
          <Stack spacing={2} sx={{ marginBottom: { xs: 4, md: 6 } }}>
            <Typography
              component="h1"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.02em",
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                lineHeight: 1.15,
              }}
            >
              Sign up for the email list to be notified of Lionel&rsquo;s
              next concert in your city!
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.875rem", md: "0.95rem" },
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Representing a venue, promoter, school, or agency?{" "}
              <Link
                href="/host-a-show"
                style={{
                  color: "rgba(255,255,255,0.95)",
                  textDecoration: "underline",
                }}
              >
                Use the host-a-show form instead
              </Link>
              .
            </Typography>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              padding: { xs: 3, md: 5 },
              borderRadius: 3,
              backgroundColor: "white",
              color: "#232323",
            }}
          >
            {status === "success" ? (
              <Stack spacing={2}>
                <Typography
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1.5rem", md: "2rem" },
                  }}
                >
                  You&rsquo;re on the list.
                </Typography>
                <Typography sx={{ color: "rgba(0,0,0,0.7)" }}>
                  I&rsquo;ll email you when I&rsquo;m playing near{" "}
                  {form.city ? `${form.city}, ${form.country}` : form.country}.
                </Typography>
                <Box sx={{ paddingTop: 1 }}>
                  <Link href="/" passHref>
                    <Button variant="contained" color="primary">
                      Back to homepage
                    </Button>
                  </Link>
                </Box>
              </Stack>
            ) : (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Box
                  aria-hidden="true"
                  sx={{
                    position: "absolute",
                    left: "-10000px",
                    top: "auto",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                  }}
                >
                  <label>
                    Website
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(e) => update("website")(e.target.value)}
                    />
                  </label>
                </Box>

                <Stack spacing={3}>
                  {status === "error" && errorMessage && (
                    <Alert severity="error">{errorMessage}</Alert>
                  )}

                  <TextField
                    label="Email"
                    type="email"
                    required
                    fullWidth
                    value={form.email}
                    onChange={(e) => update("email")(e.target.value)}
                    inputProps={{ maxLength: 320 }}
                    autoComplete="email"
                  />

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 3, md: 2 }}
                  >
                    <TextField
                      label="Country"
                      required
                      fullWidth
                      value={form.country}
                      onChange={(e) => update("country")(e.target.value)}
                      inputProps={{ maxLength: 120 }}
                      autoComplete="country-name"
                      helperText="Prefilled from your location"
                    />
                    <TextField
                      label="City (optional)"
                      fullWidth
                      value={form.city}
                      onChange={(e) => update("city")(e.target.value)}
                      inputProps={{ maxLength: 120 }}
                      autoComplete="address-level2"
                    />
                  </Stack>

                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      disabled={status === "submitting"}
                      sx={{ minWidth: 200 }}
                    >
                      {status === "submitting" ? (
                        <CircularProgress size={22} sx={{ color: "white" }} />
                      ) : (
                        "Sign me up"
                      )}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </RootLayout>
  );
};

export default RequestAShowPage;

const countryNameFromCode = (code: string | undefined): string => {
  if (!code) return "";
  try {
    return (
      new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code
    );
  } catch {
    return code;
  }
};

export const getServerSideProps: GetServerSideProps<
  RequestAShowProps
> = async ({ req }) => {
  const header = req.headers["x-vercel-ip-country"];
  const countryCode = Array.isArray(header) ? header[0] : header;
  return {
    props: {
      defaultCountry: countryNameFromCode(countryCode),
    },
  };
};
