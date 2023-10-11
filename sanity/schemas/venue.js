export default {
  name: 'venue',
  title: 'Venue',
  type: 'document',
  fields: [
    {
      name: 'city',
      title: 'City',
      type: 'reference',
      to: [{type: 'city'}],
    },
    {
      name: 'name',
      title: 'Venue Name',
      type: 'string',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'string',
    },
    {
      name: 'coordinates',
      title: 'Coordinates',
      type: 'geopoint',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
}
