import { Box, Button, Stack } from "@mui/material";
import Link from "next/link";

export default function Subscribe() {
  const subscribeUrl = process.env.NEXT_PUBLIC_CONCERTS_SUBSCRIBE_URL;

  return (
    <Box
      position={{ xs: "relative", md: "absolute" }}
      marginTop={{ xs: ".5rem", md: "0" }}
      textAlign={{ xs: "left", md: "right" }}
      bottom={{
        md: "5%",
      }}
      right={{
        md: "5%",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "column" }}
        spacing={1}
        alignItems={{ xs: "flex-start", md: "flex-end" }}
      >
        <Link href="/request-a-show" passHref>
          <Button variant="contained" color="primary">
            Request a show in your city
          </Button>
        </Link>
        {subscribeUrl && (
          <Link
            href={subscribeUrl}
            passHref
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="contained" color="primary">
              Subscribe to concerts mailing list
            </Button>
          </Link>
        )}
      </Stack>
    </Box>
  );
}
