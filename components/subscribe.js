import { Box, Button } from "@mui/material";
import Link from "next/link";

export default function Subscribe() {
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
        href="https://omniform1.com/forms/v1/landingPage/63217d1f23c4cf3c70415ee0/63ce2bd4053377993329da53"
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
