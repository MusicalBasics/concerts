import City from "./City";

// Venue.ts
export type Venue = {
  name: string;
  slug: { current: string };
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  image: { asset: { url: string } };
  city: City;
};
