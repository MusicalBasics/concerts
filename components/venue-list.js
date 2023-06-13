import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { MAPBOX_ACCESS_TOKEN } from "@/constants/api";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import styles from "./venue-list.module.css";
import AssistantDirectionIcon from "@mui/icons-material/AssistantDirection";
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

export default function VenueList({ map, venues }) {
  function onNavigationClick(venue) {
    map.current.flyTo({
      center: venue.coordinates,
      zoom: 15,
      essential: true, // this animation is considered essential with respect to prefers-reduced-motion
    });

    map.current.on("moveend", () => {
      closeAllPopups();
      venue.marker.togglePopup();
    });
  }

  function closeAllPopups() {
    venues.forEach((venue) => {
      if (venue.popup) {
        venue.popup.remove();
      }
    });
  }

  return (
    <Box
      sx={{
        maxHeight: "500px", // Change this to your desired height
        overflowY: "auto",
      }}
    >
      <Stack spacing={2} className={styles.container}>
        {venues.map((venue) => (
          <Card
            key={venue.name}
            variant="elevation"
            sx={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: grey[500] }} aria-label="level">
                  L{venue.level}
                </Avatar>
              }
              title={venue.name}
              titleTypographyProps={{ variant: "h6" }}
              subheader={`${venue.threshold} minimum`}
              subheaderTypographyProps={{ variant: "body2", color: "white" }}
            />
            <CardContent>
              <Typography variant="body2">{venue.address}</Typography>
            </CardContent>
            <CardActions>
              <IconButton
                key={venue.name}
                onClick={() => onNavigationClick(venue)}
              >
                <AssistantDirectionIcon fontSize="large" color="secondary" />
              </IconButton>
            </CardActions>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
