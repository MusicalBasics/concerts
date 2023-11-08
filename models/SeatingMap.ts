import { Section } from "./Section";

export type SeatingMap = {
  _id: string;
  sections: Section[];
  venue: { _ref: string; _id: string };
  referenceImage: { asset: { _ref: string } };
};
