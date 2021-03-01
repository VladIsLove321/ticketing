import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("fetches an order", async () => {
  const ticket = new Ticket({
    title: "title",
    price: 20,
    version: 0,
  });
  await ticket.save();
  const user = await global.signin();
  const { body: createRes } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: showRes } = await request(app)
    .get(`/api/orders/${createRes.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(showRes.id).toEqual(createRes.id);
});

it("return an error if one user tries to fetch another user order", async () => {
  const ticket = new Ticket({
    title: "title",
    price: 20,
    version: 0,
  });
  await ticket.save();
  const user = await global.signin();
  const { body: createRes } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: showRes } = await request(app)
    .get(`/api/orders/${createRes.id}`)
    .set("Cookie", await global.signin())
    .send()
    .expect(401);
});
