import City from "./city";

// Venue.ts
export type Venue = {
  _id: string;
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
