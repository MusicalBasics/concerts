import React, { useState } from "react";
import { Grid, IconButton, SvgIcon, Typography, Box } from "@mui/material";

const Seat = ({ number, isReserved, isSelected, onSelect }) => (
  <Box
    sx={{
      width: 24,
      height: 24,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: isReserved ? "not-allowed" : "pointer",
      backgroundColor: isSelected ? "blue" : "grey",
      opacity: isReserved ? 0.5 : 1,
      border: "1px solid black",
      borderRadius: "4px",
    }}
    onClick={!isReserved ? onSelect : undefined}
  >
    <Typography variant="body2">{number}</Typography>
  </Box>
);

const SeatPicker = ({ sections }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const handleSeatClick = (sectionIndex, rowIndex, seatIndex) => {
    const seatId = `${sections[sectionIndex].rowIdentifiers[rowIndex]}${sections[sectionIndex].rows[rowIndex][seatIndex].number}`;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Typography variant="h4" align="center" color="white" sx={{ mb: 2 }}>
          Stage
        </Typography>
      </Grid>
      {sections.map((section, sectionIndex) => (
        <Grid container item key={sectionIndex} xs spacing={1}>
          {section.rows.map((row, rowIndex) => (
            <Grid container item key={rowIndex} alignItems="center">
              <Grid item>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  {section.rowIdentifiers[rowIndex]}
                </Typography>
              </Grid>
              {row.map((seat, seatIndex) => (
                <Grid item key={seatIndex}>
                  <Seat
                    number={seat.number}
                    isReserved={seat.isReserved}
                    isSelected={selectedSeats.includes(
                      `${section.rowIdentifiers[rowIndex]}${seat.number}`
                    )}
                    onSelect={() =>
                      handleSeatClick(sectionIndex, rowIndex, seatIndex)
                    }
                  />
                </Grid>
              ))}
            </Grid>
          ))}
        </Grid>
      ))}
      <Grid item xs={12}>
        <Typography variant="h6">
          Selected Seats: {selectedSeats.join(", ")}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default SeatPicker;
