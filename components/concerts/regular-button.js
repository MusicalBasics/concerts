import { Button } from "@mui/material";

export default function RegularButton({ children, ...props }) {
  return (
    <Button
      {...props}
      variant="outlined"
      color="secondary"
      sx={{
        border: "1px solid silver",
        "&:hover": {
          bgcolor: "silver",
        },
      }}
    >
      {children}
    </Button>
  );
}
