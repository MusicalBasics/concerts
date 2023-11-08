import { SeatingChart } from "./seating-chart";
import { Preorder } from "./preorder";
import City from "./city";
import { Venue } from "./venue";

export type Concert = {
  _id: string;
  _ref?: string;
  name: string;
  slug: { current: string };
  city: City;
  venue: Venue;
  date: string;
  buyLink: string;
  description: any;
  seatingChart: SeatingChart;
  preorder: Preorder;
};
