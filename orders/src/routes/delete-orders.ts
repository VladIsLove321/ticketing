import express, { Request, Response } from "express";
import { Order, OrderStatus } from "../models/order";
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from "@vladislovetickets/common";

const router = express.Router();

router.delete(
  "/api/orders/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError();
    }
    if (req.currentUser?.id != order.userId) {
      throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();
    res.send(order);
  }
);

export { router as deleteOrderRouter };
