import { Box } from "@mui/material";
import Image from "next/image";
import React from "react"; // Step 1: Import React

// Step 2: Define a type for the props
type LogoProps = {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export default function Logo({ onClick }: LogoProps) {
  return (
    <Box
      onClick={onClick} // Use the typed onClick prop
      p={2}
      sx={{
        cursor: "pointer",
      }}
    >
      <Image src="/logo.png" width={100} height={100} alt="logo" />
    </Box>
  );
}
