export type Seat = {
  number: string;
  isReserved: boolean;
  isReservable: boolean;
  redeemedTicket: { _ref?: string };
  reservedBy: { _ref?: string; name?: string; email?: string };
};

export type Seats = Seat[];

export default Seat;
