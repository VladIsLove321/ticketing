import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("return an error if ticket does not exist", async () => {
  const ticketId = mongoose.Types.ObjectId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", await global.signin())
    .send({
      ticketId,
    })
    .expect(404);
});

it("return an error if ticket is already reserved", async () => {
  const ticket = new Ticket({
    title: "concert",
    price: 20,
    version: 0,
  });
  await ticket.save();

  const order = new Order({
    userId: "efefefef",
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", await global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = new Ticket({
    title: "concert",
    price: 20,
    version: 0,
  });
  await ticket.save();
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", await global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
  const order = await Order.findById(response.body.id).populate("ticket");
  expect(order?.ticket.title).toEqual(ticket.title);
});

it("emits an order when ticket created", async () => {
  const ticket = new Ticket({
    title: "concert",
    price: 20,
    version: 0,
  });
  await ticket.save();
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", await global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
  const order = await Order.findById(response.body.id).populate("ticket");
  expect(order?.ticket.title).toEqual(ticket.title);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
