import React, { useState } from "react";
import { TextField, Button, CircularProgress } from "@mui/material";
import axios from "axios";
import { isInvalidateTicket } from "@/utils/ticket-utils";
import AdminContainer from "@/components/admin/admin-container";

const Unredeem = () => {
  const [enteredTicketNumber, setEnteredTicketNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEnteredTicketNumber(event.target.value);
  };

  const handleSubmit = async () => {
    if (isInvalidateTicket(enteredTicketNumber)) {
      alert("Ticket format is invalid!");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/tickets/unredeem", {
        ticketNumber: enteredTicketNumber,
      });

      // Check for a successful response
      if (response.status === 200) {
        alert("Ticket has been successfully unredeemed.");
      } else {
        alert("An unexpected error occurred.");
      }
    } catch (error: any) {
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        alert(
          error.response.data.message ||
            "An error occurred while trying to unredeem the ticket."
        );
      } else if (error.request) {
        // The request was made but no response was received
        alert("No response from the server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        alert("There was an error setting up the request.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminContainer>
      <TextField
        fullWidth
        color="primary"
        label="Enter Ticket Number"
        variant="filled"
        value={enteredTicketNumber}
        onChange={handleInputChange}
        disabled={isSubmitting}
        style={{ backgroundColor: "white" }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={isSubmitting}
        style={{ marginTop: "16px" }}
      >
        {isSubmitting ? <CircularProgress size={24} /> : "Unredeem Ticket"}
      </Button>
    </AdminContainer>
  );
};

export default Unredeem;
