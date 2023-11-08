import { Seat } from "./seat";

interface Row {
  _key?: string;
  id: string;
  seats: Seat[];
}

export type { Row };
