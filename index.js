const stan = require("node-nats-streaming").connect(
  "test-cluster",
  "movie-saver",
  {
    url: process.env.NATS_URL
  }
);
const movieRepository = require("./src/mongo-provider");

stan.on("connect", () => {
  console.log("Worker connected to nats streaming test-cluster");
  // Subscriber can specify how many existing messages to get.
  const opts = stan.subscriptionOptions();
  opts.setDeliverAllAvailable();
  opts.setDurableName("movie-saver");
  opts.setManualAckMode(true);
  opts.setAckWait(10 * 1000); //10s
  const subscription = stan.subscribe(process.env.INCOMING_CHANNEL, opts);

  subscription.on("message", async msg => {
    console.log(`Received a message [${msg.getSequence()}] ${msg.getData()}`);
    const movieEvent = JSON.parse(msg.getData());
    const movie = movieEvent.data;

    try {
      await movieRepository.create(movie);
      msg.ack();
    } catch (err) {
      console.log(`Request couldn´t be publish by err: ${err}`);
    }
  });
});

stan.on("close", () => {
  process.exit();
});
