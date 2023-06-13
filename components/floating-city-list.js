import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Link from "next/link";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { Box, Paper, Stack } from "@mui/material";

export default function FloatingCityList({ cityLinks }) {
  return (
    <Box
      component={Paper}
      elevation={3}
      height={300}
      display={{ xs: "none", md: "block" }}
      position={{ md: "fixed" }}
      sx={{
        top: "calc(5% + 120px)",
        left: "calc(2% + 20px)",
        zIndex: 1000,
        overflow: "auto",
        bgcolor: "transparent",
      }}
    >
      <List
        sx={{
          width: "100%",
          maxWidth: 360,
          bgcolor: "rgba(255, 255, 255, 0)",
          position: "relative",
          overflow: "auto",
          maxHeight: 300,
          "& ul": { padding: 0 },
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "20px",
            border: "2px solid transparent",
            backgroundClip: "content-box",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555",
          },
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(136, 136, 136, 0.3) transparent",
        }}
        subheader={<li />}
      >
        {cityLinks.map((data) => (
          <li key={data.dateRange}>
            <ul>
              <ListSubheader
                sx={{
                  fontWeight: "semibold",
                  fontSize: "1rem",
                  color: "rgba(255,255,255, 0.8)",
                  bgcolor: "rgba(0,0,0, 0.5)",
                }}
              >
                {data.dateRange}
              </ListSubheader>
              {data.cities.map((city) => (
                <ListItem
                  key={city.name}
                  sx={{ "&:hover": { color: "secondary.main" } }}
                >
                  <Link href={city.link} passHref>
                    <Stack direction="row" spacing={1} alignItems={"center"}>
                      <LocationOnOutlinedIcon
                        fontSize="small"
                        color="inherit"
                        sx={{ "&:hover": { color: "inherit" } }}
                      />
                      <ListItemText
                        primary={city.name}
                        sx={{ "&:hover": { color: "inherit" } }}
                      />
                    </Stack>
                  </Link>
                </ListItem>
              ))}
            </ul>
          </li>
        ))}
      </List>
    </Box>
  );
}
