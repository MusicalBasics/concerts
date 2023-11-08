import { Section } from "./section";

export type SeatingChart = {
  _id: string;
  sections: Section[];
  venue: { _ref: string; _id: string };
  referenceImage: { asset: { _ref: string; url: string } };
};
