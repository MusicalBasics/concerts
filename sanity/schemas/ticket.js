// Ticket Schema
export default {
  name: 'ticket',
  type: 'document',
  title: 'Ticket',
  fields: [
    {
      name: 'concert',
      type: 'reference',
      to: [{type: 'concert'}],
      title: 'Concert',
    },
    {
      name: 'number',
      type: 'string',
      title: 'Ticket Number',
    },
  ],
}
