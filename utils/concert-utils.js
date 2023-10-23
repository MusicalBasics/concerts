import moment from "moment";

export const toSeatsText = (seats) => {
  return seats.map((seat) => `${seat.rowId}${seat.seatNumber}`).join(", ");
};

export const getFormattedDate = (date) => {
  return moment(date).format("MMMM Do YYYY").toString();
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name) => {
  // Make sure name is not empty and less than 50 characters
  return name.length > 0 && name.length < 50;
};

export const validateTicketNumbers = (ticketNumbers) => {
  if (!ticketNumbers || ticketNumbers.trim().length === 0) {
    return false;
  }

  const ticketNumberArray = ticketNumbers.split("\n");

  if (ticketNumberArray.length === 0) {
    return false;
  }

  const ticketNumberSet = new Set();

  for (const ticketNumber of ticketNumberArray) {
    if (ticketNumber.trim().length === 0) {
      continue;
    }
    ticketNumberSet.add(ticketNumber.trim());
  }

  if (ticketNumberSet.size === 0) {
    return false;
  }

  // At least one string
  const cleanedTicketNumbers = Array.from(ticketNumberSet);

  // Regex to check if each digit is a number and it's 9 digits long
  const ticketNumberRegex = /^\d{9}$/;

  // Check if each ticket number is valid
  const isValid = cleanedTicketNumbers.every((ticketNumber) =>
    ticketNumberRegex.test(ticketNumber)
  );

  return isValid;
};
