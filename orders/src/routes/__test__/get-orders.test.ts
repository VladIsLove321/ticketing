import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Order, OrderStatus } from "../../models/order";
import { Ticket } from "../../models/ticket";

const createTicket = async (price: number, title: string) => {
  const ticket = new Ticket({
    price,
    title,
  });
  await ticket.save();
  return ticket;
};

it("find a list of orders sucessfully", async () => {
  const user1 = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "user1@email.com",
  };
  const user2 = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "user2@email.com",
  };
  const ticket1 = await createTicket(10, "title1");
  const ticket2 = await createTicket(20, "title2");
  const ticket3 = await createTicket(30, "title3");
  const { body: order1 } = await request(app)
    .post("/api/orders")
    .set("Cookie", await global.signin(user1))
    .send({
      ticketId: ticket1.id,
    })
    .expect(201);
  const { body: order2 } = await request(app)
    .post("/api/orders")
    .set("Cookie", await global.signin(user2))
    .send({
      ticketId: ticket2.id,
    })
    .expect(201);
  const { body: order3 } = await request(app)
    .post("/api/orders")
    .set("Cookie", await global.signin(user2))
    .send({
      ticketId: ticket3.id,
    })
    .expect(201);
  const responseForUser2 = await request(app)
    .get("/api/orders")
    .set("Cookie", await global.signin(user2))
    .expect(200);
  expect(responseForUser2.body.length).toEqual(2);
  expect(responseForUser2.body).toEqual([order2, order3]);
});
