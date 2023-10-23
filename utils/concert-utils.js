import moment from "moment";

export const toSeatsText = (seats) => {
  return seats.map((seat) => `${seat.rowId}${seat.seatNumber}`).join(", ");
};

export const getFormattedDate = (date) => {
  return moment(date).format("MMMM Do YYYY").toString();
};
