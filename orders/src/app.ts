import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from "@vladislovetickets/common";
import { createOrderRouter } from "./routes/create-order";
import { deleteOrderRouter } from "./routes/delete-orders";
import { getOrdersRouter } from "./routes/get-orders";
import { showOrderRouter } from "./routes/show-order";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(currentUser);
app.use(createOrderRouter);
app.use(deleteOrderRouter);
app.use(getOrdersRouter);
app.use(showOrderRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
