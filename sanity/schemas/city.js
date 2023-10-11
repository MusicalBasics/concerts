export default {
  name: 'city',
  title: 'City',
  type: 'document',
  fields: [
    {
      name: 'id',
      title: 'ID',
      type: 'number',
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    },
    {
      name: 'coordinates',
      title: 'Coordinates',
      type: 'geopoint',
    },
    {
      name: 'timeFrame',
      title: 'Time Frame',
      type: 'string',
    },
    {
      name: 'startDate',
      title: 'Start Date',
      type: 'string',
    },
    {
      name: 'endDate',
      title: 'End Date',
      type: 'string',
    },
    {
      name: 'link',
      title: 'Link',
      type: 'url',
    },
    {
      name: 'totalTickets',
      title: 'Total Tickets',
      type: 'number',
    },
    {
      name: 'productId',
      title: 'Product ID',
      type: 'string',
    },
    {
      name: 'variantGID',
      title: 'Variant GID',
      type: 'string',
    },
    {
      name: 'isSoldOut',
      title: 'Is Sold Out',
      type: 'boolean',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      title: 'Venues',
      name: 'venues',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              title: 'Venue',
              name: 'venue',
              type: 'reference',
              to: [{type: 'venue'}],
            },
            {
              title: 'Level',
              name: 'level',
              type: 'number',
            },
            {
              title: 'Threshold',
              name: 'threshold',
              type: 'number',
            },
          ],
        },
      ],
    },
  ],
}
