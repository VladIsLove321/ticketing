import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import mongoose from "mongoose";
import { TicketUpdated } from "@vladislovetickets/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);
  const oldTicket = new Ticket({
    price: 10,
    title: "oldTitle",
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await oldTicket.save();
  const data: TicketUpdated["data"] = {
    id: oldTicket.id,
    price: 20,
    title: "newTitle",
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: oldTicket.version + 1,
  };
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket: oldTicket };
};

it("finds updates and saves ticket", async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  const newTicket = await Ticket.findById(data.id);
  expect(newTicket).toMatchObject({
    id: ticket.id,
    price: 20,
    title: "newTitle",
    version: data.version,
  });
});

it("acks the message", async () => {
  const { listener, data, msg, ticket } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalledTimes(1);
});

it("ack does not get called and ticket is not updated if version is not correct", async () => {
  const { listener, data, msg, ticket } = await setup();
  data.version++;
  await expect(listener.onMessage(data, msg)).rejects.toThrow();
  expect(msg.ack).not.toHaveBeenCalled();
});
