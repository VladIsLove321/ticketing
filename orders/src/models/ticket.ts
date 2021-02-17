import { Document, model, Schema } from "mongoose";
import { Order, OrderStatus } from "./order";

interface TicketInterface {
  title: string;
  price: number;
}

export type TicketDoc = {
  isReserved(): Promise<boolean>;
} & Document &
  TicketInterface;

const ticketSchema = new Schema<TicketDoc>(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        (ret.id = ret._id), delete ret._id;
      },
    },
  }
);

const TicketModel = model<TicketDoc>("Ticket", ticketSchema);

export class Ticket extends TicketModel {
  constructor(attrs: TicketInterface) {
    super(attrs);
  }
  async isReserved(): Promise<boolean> {
    const existingOrder = await Order.findOne({
      ticket: this,
      status: {
        $ne: OrderStatus.Cancelled,
      },
    });
    return !!existingOrder;
  }
}
