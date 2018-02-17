import joi from 'joi'

export default async server => {
  server.route({
    method: 'GET',
    url: '/',
    validate: {
      query: {
        type: joi.string().required(),
        offset: joi
          .number()
          .min(0)
          .default(0),
        limit: joi
          .number()
          .min(0)
          .max(100)
          .default(50)
      }
    },
    handler: async ({ query }, res) => {
      res.send({ query })
    }
  })
}
