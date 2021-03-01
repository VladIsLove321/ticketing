import request from "supertest";
import { app } from "../../app";
import { OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("marks an order as cancelled", async () => {
  const userCookie = await global.signin();
  const ticket = new Ticket({
    title: "title",
    price: 70,
    version: 0,
  });
  await ticket.save();
  const { body: orderRes } = await request(app)
    .post("/api/orders")
    .set("Cookie", userCookie)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const { body: deleteRes } = await request(app)
    .delete(`/api/orders/${orderRes.id}`)
    .set("Cookie", userCookie)
    .send()
    .expect(200);

  expect(deleteRes.id).toBe(orderRes.id);
  expect(deleteRes.status).toBe(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
  const userCookie = await global.signin();
  const ticket = new Ticket({
    title: "title",
    price: 70,
    version: 0,
  });
  await ticket.save();
  const { body: orderRes } = await request(app)
    .post("/api/orders")
    .set("Cookie", userCookie)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const { body: deleteRes } = await request(app)
    .delete(`/api/orders/${orderRes.id}`)
    .set("Cookie", userCookie)
    .send()
    .expect(200);

  expect(deleteRes.id).toBe(orderRes.id);
  expect(deleteRes.status).toBe(OrderStatus.Cancelled);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});
