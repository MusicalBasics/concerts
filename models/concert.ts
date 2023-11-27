import { SeatingChart } from "./seating-chart";
import { Preorder } from "./preorder";
import { City } from "./city";
import { Venue } from "./venue";

interface Concert {
  _id: string;
  _ref?: string;
  name: string;
  slug: { current: string };
  city: City;
  venue: Venue;
  date: string;
  timeZone: string;
  buyLink: string;
  description: any;
  seatingChart: SeatingChart;
  preorder: Preorder;
}

export type { Concert };
