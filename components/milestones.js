import BusinessIcon from "@mui/icons-material/Business";
import Timeline from "@mui/lab/Timeline";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import { Box, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";

export default function Milestones({ venues, presales }) {
  return (
    <Timeline
      position="alternate"
      sx={{
        margin: "2rem 0",
        color: "white",
      }}
    >
      {venues.map((venue, index) => {
        const isReached = presales >= venue.threshold;

        return (
          <TimelineItem key={venue.name}>
            <TimelineOppositeContent
              sx={{ m: "auto 0" }}
              align="right"
              variant="body2"
            >
              <Typography variant="h5">Level {venue.level}</Typography>
              <Typography variant="body2">{venue.threshold} Minimum</Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot color={isReached ? "primary" : "grey"}>
                <TheaterComedyIcon fontSize="large" />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent sx={{ py: "12px", px: 2 }}>
              <Stack alignItems={index % 2 === 0 ? "flex-start" : "flex-end"}>
                <Typography variant="h6" component="span">
                  {venue.name}
                </Typography>
                <Typography>{venue.city}</Typography>
                <Box
                  mt={1}
                  sx={{
                    filter: isReached ? "grayscale(0)" : "grayscale(1)",
                    overflow: "hidden",
                    "& img": {
                      transition: "transform .2s",
                      "&:hover": {
                        transform: "scale(1.25)",
                      },
                    },
                  }}
                >
                  <Image
                    src={`/images/${venue.image}`}
                    width={240}
                    height={160}
                  />
                </Box>
              </Stack>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}
