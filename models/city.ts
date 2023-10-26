export default interface City {
  _id: string;
  id: string;
  name: string;
  coordinates: number[];
  slug: {
    current: string;
  };
  image: {
    asset: {
      url: string;
    };
  };
}
