// concert.js
export default {
  name: 'concert',
  title: 'Concert',
  type: 'document',
  fields: [
    {
      title: 'Name',
      name: 'name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'city',
      title: 'City',
      type: 'reference',
      to: [{type: 'city'}],
    },
    {
      name: 'venue',
      title: 'Venue',
      type: 'reference',
      to: [{type: 'venue'}],
    },
    {
      name: 'date',
      title: 'Date',
      type: 'datetime',
    },
    {
      name: 'seatingChart',
      title: 'Seating Chart',
      type: 'object',
      fields: [
        {
          name: 'sections',
          title: 'Sections',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'section',
              fields: [
                {
                  name: 'sectionName',
                  title: 'Section Name',
                  type: 'string',
                },
                {
                  name: 'rows',
                  title: 'Rows',
                  type: 'array',
                  of: [
                    {
                      type: 'object',
                      name: 'row',
                      fields: [
                        {
                          name: 'id',
                          title: 'Row ID',
                          type: 'string',
                        },
                        {
                          name: 'seats',
                          title: 'Seats',
                          type: 'array',
                          of: [
                            {
                              type: 'object',
                              name: 'seat',
                              fields: [
                                {
                                  name: 'number',
                                  title: 'Seat Number',
                                  type: 'string',
                                },
                                {
                                  name: 'isReserved',
                                  title: 'Is Reserved',
                                  type: 'boolean',
                                },
                                {
                                  name: 'isReservable',
                                  title: 'Is Reservable',
                                  type: 'boolean',
                                },
                                {
                                  name: 'reservedBy',
                                  title: 'Reserved By',
                                  type: 'reference',
                                  to: [{type: 'customer'}],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
