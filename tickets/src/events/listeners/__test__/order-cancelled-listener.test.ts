import { OrderCancelledEvent } from "@vladislovetickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = new Ticket({
    title: "concert",
    price: 10,
    userId: "wefwe",
    orderId: orderId,
  });
  await ticket.save();
  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    ticket: {
      id: ticket.id,
    },
    version: 0,
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, ticket, orderId, msg };
};

it("updates the ticket, publishes an event and acks the msg", async () => {
  const { msg, listener, data, orderId, ticket } = await setup();
  await listener.onMessage(data, msg);
  const newTicket = await Ticket.findById(ticket.id);
  expect(newTicket!.orderId).not.toBeDefined();
  expect(newTicket!.title).toEqual("concert");
  expect(msg.ack).toBeCalledTimes(1);
  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
