import { Box, Button, Stack } from "@mui/material";
import Link from "next/link";

const ctaSx = {
  paddingX: 3,
  paddingY: 1.5,
  fontSize: { xs: "0.95rem", md: "1.05rem" },
  fontWeight: 600,
  textTransform: "none",
  borderRadius: 2,
};

export default function Subscribe() {
  const subscribeUrl = process.env.NEXT_PUBLIC_CONCERTS_SUBSCRIBE_URL;

  return (
    <Box
      position={{ xs: "relative", md: "absolute" }}
      marginTop={{ xs: ".5rem", md: "0" }}
      textAlign={{ xs: "left", md: "right" }}
      bottom={{ md: "5%" }}
      right={{ md: "5%" }}
    >
      <Stack
        direction="column"
        spacing={1.5}
        alignItems={{ xs: "flex-start", md: "flex-end" }}
      >
        <Link href="/request-a-show" passHref>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={ctaSx}
          >
            Get notified about shows in your city
          </Button>
        </Link>
        <Link href="/host-a-show" passHref>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={ctaSx}
          >
            Host a show at your venue
          </Button>
        </Link>
        {subscribeUrl && (
          <Link
            href={subscribeUrl}
            passHref
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outlined" color="secondary" size="small">
              Subscribe to mailing list
            </Button>
          </Link>
        )}
      </Stack>
    </Box>
  );
}
