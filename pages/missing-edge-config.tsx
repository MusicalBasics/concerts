// pages/missing-edge-config.tsx
import { Container, Typography, Button, Stack } from "@mui/material";
import Image from "next/image";

export default function MissingEdgeConfigPage() {
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
          Missing Edge Config
        </Typography>
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
