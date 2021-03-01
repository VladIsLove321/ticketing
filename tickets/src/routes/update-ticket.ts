import express, { Request, Response } from "express";
import {
  validateRequest,
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
} from "@vladislovetickets/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

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
    if (ticket.orderId) {
      throw new BadRequestError("Ticket is locked for order");
    }
    if (ticket.userId != req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    ticket.set({
      price,
      title,
      userId: ticket.userId,
    });
    if (!ticket.isModified()) {
      return res.send(ticket);
    }
    await ticket.save();
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
    });
    res.send(ticket);
  }
);

export { router as updateRouter };
