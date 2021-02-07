import express, { Request, Response } from "express";
import {
  validateRequest,
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from "@vladislovetickets/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.put(
  "/api/tickets",
  requireAuth,
  [
    body("title").isString().not().isEmpty().withMessage("Title is required"),
    body("id").isString().not().isEmpty().withMessage("Id is required"),
    body("price")
      .not()
      .isEmpty()
      .isFloat({ gt: 0 })
      .withMessage("Price is required and must be grater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { price, title, id } = req.body;
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new NotFoundError();
    }
    if (ticket.userId != req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    ticket.set({
      price,
      title,
      userId: ticket.userId,
    });
    await ticket.save();
    res.send(ticket);
  }
);

export { router as updateRouter };
