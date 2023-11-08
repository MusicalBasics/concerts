// pages/maintenance.tsx
import { Container, Typography, Button, Stack } from "@mui/material";
import Image from "next/image";

export default function MaintenancePage() {
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
          Maintenance Mode
        </Typography>
        <Typography variant="h4" gutterBottom>
          We are working hard to bring you the best experience possible.
        </Typography>
        <Typography variant="body1" paragraph>
          Something big is coming soon! In the meantime, check out our Official
          Website.
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
