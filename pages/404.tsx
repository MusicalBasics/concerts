// pages/404.js
import { useRouter } from "next/router";
import { Container, Typography, Button, Stack } from "@mui/material";
import Image from "next/image";

export default function Custom404() {
  const router = useRouter();

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        color: "white",
      }}
    >
      <Stack gap={2} textAlign={"center"} alignItems={"center"}>
        <Image src="/logo.png" width={300} height={300} alt="Logo" />
        <Typography variant="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" paragraph>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push("/")}
          sx={{ margin: 2 }}
        >
          Go Home
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={() => (window.location.href = "https://musicalbasics.com")}
          sx={{ margin: 2 }}
        >
          Official Website
        </Button>
      </Stack>
    </Container>
  );
}
