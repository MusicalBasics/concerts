export type Seat = {
  number: string;
  isReserved: boolean;
  isReservable: boolean;
  redeemedTicket: { _ref: string };
  reservedBy: { _ref: string };
};

export type Seats = Seat[];

export default Seat;
