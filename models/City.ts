export type City = {
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
};

export type Cities = City[];

export default City;
