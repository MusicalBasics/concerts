// schemas/customer.js
export default {
  name: 'customer',
  type: 'document',
  title: 'Customers',
  fields: [
    {
      name: 'concert',
      title: 'Concert',
      type: 'reference',
      to: [{type: 'concert'}],
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(1),
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    },
    {
      name: 'ticketCount',
      title: 'Ticket Count',
      type: 'number',
      validation: (Rule) => Rule.required().min(1),
    },

    {
      name: 'redeemed',
      title: 'Redeemed',
      type: 'boolean',
    },
  ],
}
