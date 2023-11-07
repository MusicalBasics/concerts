import { Ticket } from "./Ticket";

interface Customer {
  _id: string;
  name: string;
  email: string;
  tickets?: Ticket[];
}

export type { Customer };