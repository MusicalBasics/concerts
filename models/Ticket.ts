// models/ticket.ts

import { Concert } from "./Concert";
import Seat from "./Seat";

interface Customer {
  _id: string;
  name: string;
  email: string;
}

interface Ticket {
  number: string;
  concert: Concert;
  redeemed: boolean;
  type: string;
  customer: Customer;
  seat: Seat;
}

export type { Ticket };
