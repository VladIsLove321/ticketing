import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const start = async () => {
  checkForEnv();
  await connectToNats();
  startNatsListeners();
  console.log("Expiration service started");
};

const startNatsListeners = () => {
  new OrderCreatedListener(natsWrapper.client).listen();
};

const checkForEnv = () => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }
};

const connectToNats = async () => {
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      {
        url: process.env.NATS_URL,
      }
    );
  } catch (err) {
    throw new Error(err);
  }
};

start();
