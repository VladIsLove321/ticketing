import { ExpirationCompleteEvent } from "@vladislovetickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order, OrderStatus } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 10,
    title: "concert",
    version: 0,
  });
  await ticket.save();
  const order = new Order({
    status: OrderStatus.Created,
    userId: "edwefd",
    expiresAt: new Date(),
    ticket,
  });
  await order.save();
  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, ticket, data, msg };
};

it("updates the order status to cancelled", async () => {
  const { data, listener, msg, order, ticket } = await setup();
  await listener.onMessage(data, msg);
  const upOrder = await Order.findById(order.id);
  expect(upOrder!.status).toEqual(OrderStatus.Cancelled);
});
it("emit an order cancelled event", async () => {
  const { data, listener, msg, order, ticket } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toBeCalledTimes(1);
});
it("ack the messsage", async () => {
  const { data, listener, msg, order, ticket } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toBeCalledTimes(1);
});
