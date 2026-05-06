import { Box, Button } from "@mui/material";
import Link from "next/link";

export default function Subscribe() {
  const subscribeUrl = process.env.NEXT_PUBLIC_CONCERTS_SUBSCRIBE_URL;

  if (!subscribeUrl) {
    return null;
  }

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
    </Box>
  );
}
