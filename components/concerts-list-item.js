import { toConcertDate } from "@/utils/concert-utils";
import { Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Link from "next/link";

export default function ConcertsListItem({
  concert,
  onSelect,
  isSelected,
  isSoldOut,
}) {
  const { city, preorder, buyLink } = concert;
  const { timeFrame } = preorder;

  const link = isSoldOut ? buyLink : `/concerts/${concert._id}`;
  const linkText = isSoldOut ? "Buy Tickets" : "Preorder";

  const dateText = isSoldOut ? toConcertDate(concert.date) : timeFrame;

  const LearnMoreButton = () => {
    return (
      <Link href={`/concerts/${concert._id}`}>
        <Button variant="contained">Learn More</Button>
      </Link>
    );
  };

  return (
    <Card
      sx={{
        display: "flex",
        zIndex: 1,
        backgroundColor: [
          isSelected ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
        ],
        border: [
          isSelected ? "2px solid rgba(255,255,255)" : "1px solid transparent",
        ],
        cursor: "pointer",
      }}
      onClick={() => onSelect(city.id)}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <CardContent sx={{ flex: "1 0 auto" }}>
          <Typography component="div" variant="h5">
            {city.name}
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
          >
            {dateText}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Link href={link}>
              <Button variant="contained">{linkText}</Button>
            </Link>
            {isSoldOut && <LearnMoreButton />}
          </Stack>
        </CardContent>
      </Box>
    </Card>
  );
}
