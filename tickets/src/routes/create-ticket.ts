import express, { Request, Response } from "express";
import { requireAuth } from "@vladislovetickets/common";
import { validateRequest } from "@vladislovetickets/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").isString().not().isEmpty().withMessage("Title is required"),
    body("price")
      .not()
      .isEmpty()
      .isFloat({ gt: 0 })
      .withMessage("Price is required and must be grater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { price, title } = req.body;
    const ticket = new Ticket({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await ticket.save();
    res.status(201).send(ticket);
  }
);

export { router as CreateTicketRouter };
