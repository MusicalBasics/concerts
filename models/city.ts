interface City {
  _id: string;
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  slug: {
    current: string;
  };
  image: {
    asset: {
      url: string;
    };
  };
}

export type { City };
