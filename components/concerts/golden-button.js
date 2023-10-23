import { Button } from "@mui/material";

export default function GoldenButton({ children, ...props }) {
  return (
    <Button
      {...props}
      variant="outlined"
      color="secondary"
      sx={{
        border: "1px solid DarkGoldenRod",
        "&:hover": {
          bgcolor: "DarkGoldenRod",
        },
      }}
    >
      {children}
    </Button>
  );
}
