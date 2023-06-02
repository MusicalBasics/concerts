import { Box, Stack, Typography } from "@mui/material";
import Link from "next/link";

export default function Footer() {
  return (
    <Box
      sx={{
        width: "100%",
        position: "fixed",
        bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        color: "white",
      }}
      paddingBottom={1}
    >
      <Stack textAlign="center">
        <Typography variant="caption">
          © {new Date().getFullYear()}{" "}
          <Link href="https://musicalbasics.com">
            MusicalBasics Productions
          </Link>
          .
        </Typography>
        <Typography variant="caption">All rights reserved.</Typography>
      </Stack>
    </Box>
  );
}
