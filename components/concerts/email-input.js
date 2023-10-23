import { TextField } from "@mui/material";

export default function EmailInput({ value, onChange, ...props }) {
  return (
    <TextField
      value={value}
      onChange={onChange}
      type="email"
      variant="outlined"
      color="secondary"
      label="Email"
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
