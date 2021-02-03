import request from "supertest";
import { app } from "../../app";

it("check logout", async () => {
  const cookie = await global.signin();
  let res = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send({})
    .expect(200);
  expect(res.body.currentUser).toBeDefined();
});
