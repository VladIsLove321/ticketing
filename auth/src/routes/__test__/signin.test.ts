import request from "supertest";
import { app } from "../../app";

it("correct user signin should send correct user data", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201)
    .then((res) => {
      expect(res.get("Set-Cookie")).toBeDefined();
    });

  await request(app)
    .get("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200);
});

it("fails if user does not exist", async () => {
  await request(app)
    .get("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400);
});
