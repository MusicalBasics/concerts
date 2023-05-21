"use client";
import { Box } from "@mui/material";
import Image from "next/image";

export default function Logo({ onClick }) {
  return (
    <Box
      onClick={onClick}
      p={2}
      sx={{
        cursor: "pointer",
      }}
    >
      <Image src="/logo.png" width={100} height={100} alt="logo" />
    </Box>
  );
}
