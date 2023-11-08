import { SeatingMap } from "./seating-chart";
import { Preorder } from "./preorder";
import City from "./city";
import { Venue } from "./venue";

export type Concert = {
  _id: string;
  name: string;
  slug: { current: string };
  city: City;
  venue: Venue;
  date: string;
  buyLink: string;
  description: any;
  seatingChart: SeatingMap;
  preorder: Preorder;
};
