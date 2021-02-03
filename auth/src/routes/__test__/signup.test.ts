import request from "supertest";
import { app } from "../../app";

it("return full info on succeessfull signup", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201)
    .then((res) => {
      expect(res.body.email).toBe("test@test.com");
      expect(res.body.id).toBeDefined();
      expect(res.get("Set-Cookie")).toBeDefined();
    });
});

it("return 400 with envalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "testtest.com",
      password: "password",
    })
    .expect(400, {
      errors: [
        {
          message: "Email must be valid",
          field: "email",
        },
      ],
    });
});

it("return 400 with envalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "p",
    })
    .expect(400, {
      errors: [
        {
          message: "Password must be between 4 and 20 characters",
          field: "password",
        },
      ],
    });
});

it("return 400 with envalid password and envalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "testtest.com",
      password: "p",
    })
    .expect(400, {
      errors: [
        {
          message: "Email must be valid",
          field: "email",
        },
        {
          message: "Password must be between 4 and 20 characters",
          field: "password",
        },
      ],
    });
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201)
    .then((res) => {
      expect(res.body.email).toBe("test@test.com");
      expect(res.body.id).toBeDefined();
    });

  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400, {
      errors: [
        {
          message: "Email in use",
        },
      ],
    });
});
