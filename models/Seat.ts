export type Seat = {
  _key?: string;
  number: string;
  isReserved: boolean;
  isReservable: boolean;
  row: string;
  section: string;
  redeemedTicket: { _ref?: string };
  reservedBy: { _ref?: string; name?: string; email?: string };
};

export type Seats = Seat[];

export default Seat;
