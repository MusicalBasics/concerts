import React, { FC, useState } from "react";
import { Container, TextField, Button, Typography } from "@mui/material";
import axios from "axios";
import { isInvalidateTicket } from "@/utils/ticket-utils";

const SendTicketsPage: FC = () => {
  const [enteredTicketNumbers, setEnteredTicketNumbers] = useState("");

  const handleSendTickets = async () => {
    // Split the input by new lines and filter out any empty lines
    const ticketsArray = enteredTicketNumbers
      .split("\n")
      .filter((line) => line.trim() !== "");

    // Validate each ticket number
    const invalidTickets = ticketsArray.filter(isInvalidateTicket);

    if (invalidTickets.length > 0) {
      // Show an error message or handle invalid ticket numbers
      alert("Please correct the invalid ticket numbers before sending.");
      return;
    }

    try {
      const url = `/api/tickets/send`;
      await axios.post(url, { ticketNumbers: ticketsArray });
      alert("Tickets sent successfully!");
    } catch (error: any) {
      console.error("Failed to send tickets:", error);
      alert(
        "Failed to send tickets: " +
          (error.response?.data.message || error.message)
      );
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" color="wheat" gutterBottom>
        Send Tickets
      </Typography>
      <TextField
        color="secondary"
        fullWidth
        label="Enter Ticket Numbers (one per line)"
        multiline
        rows={10} // Adjust the number of rows as needed
        value={enteredTicketNumbers}
        onChange={(e) => setEnteredTicketNumbers(e.target.value)}
        margin="normal"
        variant="filled"
        sx={{
          backgroundColor: "wheat",
        }}
        // make color of text white
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSendTickets}
        sx={{ mt: 2 }}
      >
        Send Tickets
      </Button>
    </Container>
  );
};

export default SendTicketsPage;
