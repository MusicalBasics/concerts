import { SeatingMap } from "./SeatingMap";
import { Preorder } from "./Preorder";
import City from "./City";
import { Venue } from "./Venue";

export type Concert = {
  _id: string;
  name: string;
  slug: { current: string };
  city: City;
  venue: Venue;
  date: string;
  buyLink: string;
  seatingChart: SeatingMap;
  preorder: Preorder;
};
