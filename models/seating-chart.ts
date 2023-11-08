import { Section } from "./section";

interface SeatingChart {
  _id: string;
  sections: Section[];
  venue: { _ref: string; _id: string };
  referenceImage: { asset: { _ref: string; url: string } };
}

export type { SeatingChart };
