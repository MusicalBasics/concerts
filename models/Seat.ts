interface Seat {
  _id?: string;
  _key?: string;
  number: string;
  row: string;
  section: string;
  isReserved?: boolean;
  isReservable?: boolean;
  redeemedTicket?: { _ref?: string };
  reservedBy?: { _ref?: string; name?: string; email?: string };
}

export type { Seat };
