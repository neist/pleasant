import joi from 'joi'

export default async server => {
  server.route({
    method: 'GET',
    url: '/',
    validate: {
      query: {
        type: joi
          .string()
          .valid(['type-a', 'type-b'])
          .required(),
        offset: joi
          .number()
          .default(0)
          .min(0),
        limit: joi
          .number()
          .default(50)
          .min(0)
          .max(100)
      }
    },
    handler: async ({ query }, res) => {
      res.send({ query })
    }
  })
}
