import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has a route listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed by authorized users", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .send({})
    .expect(401, {
      errors: [
        {
          message: "You are not authorized for this action",
        },
      ],
    });
});

it("returns status other than 401 if user signed in", async () => {
  const cookie = await global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns error for invalid title", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", await global.signin())
    .send({
      title: "",
      price: 10,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", await global.signin())
    .send({
      price: 10,
    })
    .expect(400);
});

it("returns error for invalid price", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", await global.signin())
    .send({
      title: "my title",
      price: -1,
    })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", await global.signin())
    .send({
      title: "my title",
    })
    .expect(400);
});

it("creates ticket with valid input", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", await global.signin())
    .send({
      title: "My title",
      price: 55,
    })
    .expect(201);
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(55);
  expect(tickets[0].title).toEqual("My title");
});

it("publishes an event", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", await global.signin())
    .send({
      title: "My title",
      price: 55,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1);
});
