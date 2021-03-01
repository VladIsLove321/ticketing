import { OrderStatus } from "@vladislovetickets/common";
import mongoose, { mongo } from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Payment } from "../../models/payments";
import { stripe } from "../../stripe";

jest.mock("../../stripe");

it("throw 404 if ordre does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", await global.signin())
    .send({
      orderId: mongoose.Types.ObjectId().toHexString(),
      token: "efefef",
    })
    .expect(404);
});
it("throw 401 if order does not belong to user", async () => {
  const order = new Order({
    price: 10,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", await global.signin())
    .send({
      orderId: order.id,
      token: "efefef",
    })
    .expect(401);
});
it("throw 400 if order is cancelled", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = new Order({
    price: 10,
    status: OrderStatus.Cancelled,
    userId,
    version: 0,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", await global.signin({ id: userId, email: "efef@mail.ru" }))
    .send({
      orderId: order.id,
      token: "efefef",
    })
    .expect(400);
});

it("returns a 201 with valid input", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = new Order({
    price: 10,
    status: OrderStatus.Created,
    userId,
    version: 0,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", await global.signin({ id: userId, email: "efef@mail.ru" }))
    .send({
      orderId: order.id,
      token: "tok_visa",
    })
    .expect(201);
  expect(stripe.charges.create).toHaveBeenCalledTimes(1);
  expect(stripe.charges.create).toHaveBeenLastCalledWith({
    currency: "usd",
    amount: order.price * 100,
    source: "tok_visa",
  });
});

it("check if payment was saved", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  const order = new Order({
    price: 10,
    status: OrderStatus.Created,
    userId,
    version: 0,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", await global.signin({ id: userId, email: "efef@mail.ru" }))
    .send({
      orderId: order.id,
      token: "tok_visa",
    })
    .expect(201);
  expect(stripe.charges.create).toHaveBeenCalledTimes(1);
  expect(stripe.charges.create).toHaveBeenLastCalledWith({
    currency: "usd",
    amount: order.price * 100,
    source: "tok_visa",
  });
  const payment = await Payment.findOne({});
  expect(payment!.stripeId).toEqual("test");
});
