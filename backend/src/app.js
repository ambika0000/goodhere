const fastify = require("fastify")({ logger: true })

const { setupPgBossQueue } = require("./pg")
const { TWITTER_USER_OBJECT } = require("./twitterUserObjectScraping")

async function buildFastify() {
  const pgBossQueue = await setupPgBossQueue()

  fastify.route({
    method: "POST",
    url: "/twitterUserObject",
    schema: {
      body: {
        type: "object",
        required: ["orgId", "twitterScreenName"],
        properties: {
          orgId: { type: "string" },
          twitterScreenName: { type: "string" },
        },
      },
    },
    handler(req, res) {
      fastify.log.info(
        "Received request to scrape Twitter user object: ",
        req.body
      )
      return pgBossQueue.publish(TWITTER_USER_OBJECT, req.body)
    },
  })

  await fastify.listen(process.env.PORT || 3000, "0.0.0.0")
  fastify.log.info(`server listening on ${fastify.server.address().port}`)
  return fastify
}

module.exports = buildFastify