import { TextField } from "@mui/material";

export default function NameInput({ value, onChange, ...props }) {
  return (
    <TextField
      value={value}
      onChange={onChange}
      variant="outlined"
      color="secondary"
      label="Ticket Numbers"
      multiline
      rows={4}
      sx={{
        width: 250,
        borderRadius: 4,
        "& label": { color: "white" },
        "& .MuiOutlinedInput-root": {
          "& fieldset": { borderColor: "white" },
          "&:hover fieldset": { borderColor: "white" },
          "&.Mui-focused fieldset": { borderColor: "white" },
        },
      }}
      {...props}
    />
  );
}
