import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

let mongo: MongoMemoryServer;

interface TokenPayload {
  id: string;
  email: string;
}

declare global {
  namespace NodeJS {
    interface Global {
      signin(payload?: TokenPayload): Promise<string[]>;
    }
  }
}

jest.mock("../nats-wrapper");

beforeAll(async () => {
  process.env.JWT_KEY = "wfwefew";
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (userPayload?: TokenPayload) => {
  const payload = userPayload
    ? userPayload
    : {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: "test@test.com",
      };

  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const session = { jwt: token };
  const sessionJSON = JSON.stringify(session);
  const sessionBase64 = Buffer.from(sessionJSON).toString("base64");
  const cookie = `express:sess=${sessionBase64}`;
  const fakePromise: Promise<string[]> = new Promise((res, rej) => {
    res([cookie]);
  });
  return fakePromise;
};
