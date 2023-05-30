import { Box, Typography } from "@mui/material";
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
        padding: "10px 0",
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()}{" "}
        <Link href="https://musicalbasics.com">MusicalBasics Productions</Link>.
        All rights reserved.
      </Typography>
    </Box>
  );
}
