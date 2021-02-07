import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

it("returns a 404 if ticket is not found", async () => {
  const randomId = new mongoose.Types.ObjectId().toHexString();
  const res = await request(app).get(`/api/tickets/${randomId}`).expect(404);
});

it("returns a ticket if ticket is defined", async () => {
  const ticket = {
    title: "Title",
    price: 10,
  };
  const createdTicket = await request(app)
    .post("/api/tickets")
    .set("Cookie", await global.signin())
    .send(ticket)
    .expect(201);

  const ticketOnServer = await request(app)
    .get(`/api/tickets/${createdTicket.body.id}`)
    .expect(200);
  expect(ticketOnServer.body.title).toEqual(ticket.title);
  expect(ticketOnServer.body.price).toEqual(ticket.price);
});
