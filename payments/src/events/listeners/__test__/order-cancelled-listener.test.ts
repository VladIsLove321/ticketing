import { OrderCancelledEvent, OrderStatus } from "@vladislovetickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";

const setup = async () => {
  const orderId = mongoose.Types.ObjectId().toHexString();
  const listener = new OrderCancelledListener(natsWrapper.client);
  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    ticket: {
      id: "eqewf",
    },
    version: 1,
  };
  const order = new Order({
    price: 10,
    status: OrderStatus.Created,
    userId: "ewfewf",
    version: 0,
    id: orderId,
  });
  await order.save();
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, order, msg };
};

it("changes a status of order to cancelled and ack the msg", async () => {
  const { data, listener, msg, order } = await setup();
  await listener.onMessage(data, msg);
  const newOrder = await Order.findById(order.id);
  expect(newOrder!.price).toEqual(order.price);
  expect(newOrder!.id).toEqual(order.id);
  expect(newOrder!.status).toEqual(OrderStatus.Cancelled);
  expect(newOrder!.version).toEqual(1);
  expect(msg.ack).toHaveBeenCalledTimes(1);
});
