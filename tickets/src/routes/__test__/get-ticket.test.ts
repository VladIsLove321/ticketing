import request from "supertest";
import { app } from "../../app";

it("Returning tickets to whoever whants it", async () => {
  const ticket1 = {
    title: "Title1",
    price: 10,
  };
  const ticket2 = {
    title: "Title2",
    price: 30,
  };
  await request(app)
    .post("/api/tickets")
    .set("Cookie", await global.signin())
    .send(ticket1)
    .expect(201);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", await global.signin())
    .send(ticket2)
    .expect(201);

  const res = await request(app).get("/api/tickets").send({}).expect(200);
  expect(res.body.length).toEqual(2);
});
