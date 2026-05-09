import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Head from "next/head";
import Link from "next/link";
import { FC, useState } from "react";

import ResponsiveAppBar from "@/components/app-bar";
import RootLayout from "@/components/root-layout";

const REQUESTER_TYPES = [
  { value: "venue", label: "Venue / theater" },
  { value: "promoter", label: "Promoter / agency" },
  { value: "school", label: "School / university" },
  { value: "other", label: "Other" },
];

const AUDIENCE_SIZES = [
  { value: "<100", label: "Fewer than 100" },
  { value: "100-500", label: "100 – 500" },
  { value: "500-2000", label: "500 – 2,000" },
  { value: "2000+", label: "More than 2,000" },
  { value: "not-sure", label: "Not sure" },
];

const NOTES_MAX = 1000;

const initialForm = {
  name: "",
  email: "",
  org_name: "",
  requester_type: "",
  city: "",
  country: "",
  audience_size: "",
  target_date: "",
  website_url: "",
  notes: "",
  website: "", // honeypot
};

const HostAShowPage: FC = () => {
  const [form, setForm] = useState(initialForm);
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
          // Map website_url → website (real field), keep honeypot field
          // labelled `website` only on the request-a-show page. Here we send
          // the real org website under a clearer key on the wire.
          name: form.name,
          email: form.email,
          city: form.city,
          country: form.country,
          requester_type: form.requester_type,
          org_name: form.org_name,
          audience_size: form.audience_size,
          target_date: form.target_date,
          org_website: form.website_url,
          notes: form.notes,
          website: form.website, // honeypot
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.error ||
            "Something went wrong sending your request. Please try again."
        );
      }

      setStatus("success");
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(
        error?.message ||
          "Something went wrong sending your request. Please try again."
      );
    }
  };

  return (
    <RootLayout>
      <Head>
        <title>Host a Show | MusicalBasics</title>
        <meta
          name="description"
          content="Venues, promoters, agencies, and schools: invite Lionel Yu (MusicalBasics) to perform at your space."
        />
        <meta property="og:title" content="Host a Show | MusicalBasics" />
        <meta
          property="og:description"
          content="Invite Lionel Yu to perform at your venue, festival, school, or event."
        />
        <meta
          property="og:image"
          content="/images/new-york-carnegie-zankel-hall.jpg"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://concerts.musicalbasics.com/host-a-show"
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
          {/* Hero */}
          <Stack spacing={2} sx={{ marginBottom: { xs: 4, md: 6 } }}>
            <Typography
              component="h1"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.02em",
                fontSize: { xs: "2rem", md: "3rem" },
                lineHeight: 1.1,
              }}
            >
              Host a show.
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "1rem", md: "1.125rem" },
                color: "rgba(255,255,255,0.8)",
                maxWidth: "640px",
              }}
            >
              Venues, promoters, agencies, and schools &mdash; tell me about
              your space and I&rsquo;ll get back to you personally if there is
              a fit.
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: "0.875rem", md: "0.95rem" },
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Are you a fan?{" "}
              <Link
                href="/request-a-show"
                style={{
                  color: "rgba(255,255,255,0.95)",
                  textDecoration: "underline",
                }}
              >
                Use the request-a-show form instead
              </Link>
              .
            </Typography>
          </Stack>

          {/* Form / success */}
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
                  Thanks &mdash; I&rsquo;ll personally read this.
                </Typography>
                <Typography sx={{ color: "rgba(0,0,0,0.7)" }}>
                  You&rsquo;ll hear from me if it&rsquo;s a fit. In the
                  meantime, feel free to share the request-a-show link with
                  your audience.
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
                {/* Honeypot */}
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

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 3, md: 2 }}
                  >
                    <TextField
                      label="Your name"
                      required
                      fullWidth
                      value={form.name}
                      onChange={(e) => update("name")(e.target.value)}
                      inputProps={{ maxLength: 200 }}
                      autoComplete="name"
                    />
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
                  </Stack>

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 3, md: 2 }}
                  >
                    <TextField
                      label="Organization or venue name"
                      required
                      fullWidth
                      value={form.org_name}
                      onChange={(e) => update("org_name")(e.target.value)}
                      inputProps={{ maxLength: 200 }}
                    />
                    <FormControl required fullWidth>
                      <InputLabel id="requester-type-label">Role</InputLabel>
                      <Select
                        labelId="requester-type-label"
                        label="Role"
                        value={form.requester_type}
                        onChange={(e) =>
                          update("requester_type")(e.target.value as string)
                        }
                      >
                        {REQUESTER_TYPES.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={{ xs: 3, md: 2 }}
                  >
                    <TextField
                      label="City"
                      required
                      fullWidth
                      value={form.city}
                      onChange={(e) => update("city")(e.target.value)}
                      inputProps={{ maxLength: 120 }}
                    />
                    <TextField
                      label="Country"
                      required
                      fullWidth
                      value={form.country}
                      onChange={(e) => update("country")(e.target.value)}
                      inputProps={{ maxLength: 120 }}
                    />
                  </Stack>

                  <FormControl fullWidth>
                    <InputLabel id="audience-size-label">
                      Approximate audience size (optional)
                    </InputLabel>
                    <Select
                      labelId="audience-size-label"
                      label="Approximate audience size (optional)"
                      value={form.audience_size}
                      onChange={(e) =>
                        update("audience_size")(e.target.value as string)
                      }
                    >
                      <MenuItem value="">
                        <em>No preference</em>
                      </MenuItem>
                      {AUDIENCE_SIZES.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Target date or date range (optional)"
                    placeholder="Summer 2026, Q4, flexible…"
                    fullWidth
                    value={form.target_date}
                    onChange={(e) => update("target_date")(e.target.value)}
                    inputProps={{ maxLength: 200 }}
                  />

                  <TextField
                    label="Website (optional)"
                    placeholder="https://…"
                    fullWidth
                    type="url"
                    value={form.website_url}
                    onChange={(e) => update("website_url")(e.target.value)}
                    inputProps={{ maxLength: 500 }}
                  />

                  <TextField
                    label="Anything else you'd like me to know (optional)"
                    fullWidth
                    multiline
                    minRows={4}
                    value={form.notes}
                    onChange={(e) => update("notes")(e.target.value)}
                    inputProps={{ maxLength: NOTES_MAX }}
                    helperText={`${form.notes.length} / ${NOTES_MAX}`}
                  />

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
                        "Send request"
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

export default HostAShowPage;
