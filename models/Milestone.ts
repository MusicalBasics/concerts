import { Venue } from "./Venue";

export type Milestone = {
  venue: Venue;
  level: number;
  threshold: number;
};

export type Milestones = Milestone[];

export default Milestone;
