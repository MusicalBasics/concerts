import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Link from "next/link";

export default function CityListItem({
  city,
  onSelect,
  isSelected,
  isSoldOut,
}) {
  function onCityClick() {
    onSelect(city.id);
  }

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
      onClick={onCityClick}
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
            {city.timeFrame}
          </Typography>
          <Button variant="contained" disabled={isSoldOut}>
            <Link href={`/cities/${city.id}`}>
              {isSoldOut ? "Sold Out" : "Preorder"}
            </Link>
          </Button>
        </CardContent>
      </Box>
    </Card>
  );
}
