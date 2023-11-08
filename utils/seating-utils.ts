import Seat from "@/models/seat";

export function toLongSeatString(seat: Seat) {
  const seatString = toSeatString(seat);
  return `${seat.section}-${seatString}`;
}

export function toSeatString(seat: Seat) {
  const { row, number } = seat;
  return `${row}${number}`;
}
