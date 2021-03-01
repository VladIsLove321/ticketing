import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

const createId = () => {
  return new mongoose.Types.ObjectId().toHexString();
};

const userCred = {
  id: createId(),
  email: "lala@mail.ru",
};

const createTicket = async () => {
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", await global.signin(userCred))
    .send({
      title: "old title",
      price: 10,
    })
    .expect(201);
  expect(res.body.title).toEqual("old title");
  expect(res.body.price).toEqual(10);
  return res.body;
};

it("updates the title if user authed and owns ticket and data is correct", async () => {
  const ticket = await createTicket();
  await request(app)
    .put("/api/tickets")
    .set("Cookie", await global.signin(userCred))
    .send({
      id: ticket.id,
      price: 20,
      title: "new Title",
    })
    .expect(200);
  const res = await request(app).get(`/api/tickets/${ticket.id}`).expect(200);

  expect(res.body.title).toEqual("new Title");
  expect(res.body.price).toEqual(20);
  expect(res.body.userId).toEqual(userCred.id);
});

it("Return 404 if provided id does not exist", async () => {
  await request(app)
    .put("/api/tickets")
    .set("Cookie", await global.signin())
    .send({
      id: createId(),
      title: "new title",
      price: 20,
    });
});

it("Return 401 if user is not authenticated", async () => {
  await request(app)
    .put("/api/tickets")
    .send({
      id: createId(),
      title: "new title",
      price: 20,
    })
    .expect(401);
});

it("Return 401 if user does not own a ticket", async () => {
  const ticket = await createTicket();

  await request(app)
    .put("/api/tickets")
    .set("Cookie", await global.signin())
    .send({
      id: ticket.id,
      title: "new title",
      price: 30,
    })
    .expect(401);
});

it("returns 400 if user supplied wrong price or title", async () => {
  const ticket = await createTicket();
  await request(app)
    .put("/api/tickets")
    .set("Cookie", await global.signin(userCred))
    .send({
      id: ticket.id,
      title: "",
      price: -1,
    })
    .expect(400);
});

it("publishes an event", async () => {
  const ticket = await createTicket();
  await request(app)
    .put("/api/tickets")
    .set("Cookie", await global.signin(userCred))
    .send({
      id: ticket.id,
      price: 20,
      title: "new Title",
    })
    .expect(200);
  const res = await request(app).get(`/api/tickets/${ticket.id}`).expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
});

it("rejects updates if the ticket is reserved", async () => {
  const ticket = await createTicket();
  const dbTicket = await Ticket.findById(ticket.id);
  dbTicket!.set({ orderId: new mongoose.Types.ObjectId().toHexString });
  await dbTicket?.save();
  await request(app)
    .put("/api/tickets")
    .set("Cookie", await global.signin(userCred))
    .send({
      id: ticket.id,
      price: 20,
      title: "new Title",
    })
    .expect(400);
});
