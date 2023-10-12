import React, { useState } from "react";
import {
  Grid,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

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
    <Typography variant="caption">{number}</Typography>
  </Box>
);

const getAlignment = (sectionName) => {
  switch (sectionName) {
    case "left":
      return "flex-end";
    case "center":
      return "center";
    case "right":
      return "flex-start";
    default:
      return "center";
  }
};

const SeatPicker = ({
  sections,
  ticketCount,
  onSubmit,
  selectedSeats,
  setSelectedSeats,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  console.log(selectedSeats);

  const handleSeatClick = (sectionName, rowId, seatNumber) => {
    const seatId = { sectionName, rowId, seatNumber };
    setSelectedSeats((prev) => {
      const isAlreadySelected = prev.some(
        (seat) =>
          seat.sectionName === sectionName &&
          seat.rowId === rowId &&
          seat.seatNumber === seatNumber
      );
      if (isAlreadySelected) {
        return prev.filter(
          (seat) =>
            !(
              seat.sectionName === sectionName &&
              seat.rowId === rowId &&
              seat.seatNumber === seatNumber
            )
        );
      } else if (prev.length < ticketCount) {
        return [...prev, seatId];
      }
      return prev;
    });
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogSubmit = () => {
    onSubmit(selectedSeats);
    setDialogOpen(false);
  };

  return (
    <Box sx={{ width: "1300px" }} mb={3}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Available Tickets: {ticketCount - selectedSeats.length}
      </Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        {`Selected Seats: ${selectedSeats
          .map((seat) => `${seat.rowId}${seat.seatNumber}`)
          .join(", ")}`}
      </Typography>
      <Typography variant="h2" align="center" color="white" sx={{ mb: 3 }}>
        Stage
      </Typography>
      <Grid container spacing={1}>
        {sections.map((section, sectionIndex) => (
          <Grid container item key={sectionIndex} xs spacing={1}>
            {section.rows.map((row, rowIndex) => (
              <Grid
                container
                item
                key={rowIndex}
                alignItems="flex-end"
                justifyContent={getAlignment(section.sectionName)}
              >
                <Grid item>
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    {row.id}
                  </Typography>
                </Grid>
                {row.seats.map((seat, seatIndex) => (
                  <Grid item key={seatIndex}>
                    <Seat
                      number={seat.number}
                      isReserved={seat.isReserved}
                      isSelected={selectedSeats.some((s) => {
                        console.log(s);

                        return (
                          s.sectionName === section.sectionName &&
                          s.rowId === row.id &&
                          s.seatNumber === seat.number
                        );
                      })}
                      onSelect={() =>
                        handleSeatClick(
                          section.sectionName,
                          row.id,
                          seat.number
                        )
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>

      <Button
        variant="outlined"
        color="secondary"
        onClick={handleDialogOpen}
        disabled={selectedSeats.length < ticketCount} // Disable the button if no seats are selected
        sx={{
          mt: 3,
          width: "200px", // Set a width
          height: "60px", // Set a height
          fontSize: "1.5rem", // Increase font size
          mx: "auto", // Center the button
          display: "block", // Necessary for mx: auto to work
        }}
      >
        Submit
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Are You Sure?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Seat Selections Are Final
            <br />
            Your Selected Seats Are:
            <br />
            <b>
              {selectedSeats
                .map((seat) => `${seat.rowId}${seat.seatNumber}`)
                .join(", ")}
            </b>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogSubmit}
            color="primary"
            autoFocus
            disabled={selectedSeats.length === 0} // Disable the button if no seats are selected
          >
            Yes, reserve
          </Button>
          <Button onClick={handleDialogClose} color="primary">
            No, take me back
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeatPicker;
