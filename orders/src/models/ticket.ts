import { Document, model, Schema } from "mongoose";
import { Order, OrderStatus } from "./order";

interface TicketInterface {
  id?: string;
  title: string;
  price: number;
  version: number;
}

export type TicketDoc = {
  isReserved(): Promise<boolean>;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
  version: number;
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
    versionKey: "version",
    toJSON: {
      transform(doc, ret) {
        (ret.id = ret._id), delete ret._id;
      },
    },
  }
);

const TicketModel = model<TicketDoc>("Ticket", ticketSchema);

export class Ticket extends TicketModel {
  constructor(attrs: TicketInterface | undefined) {
    if (attrs) {
      const { id, ...rest } = attrs;
      super({ _id: id, ...rest });
    } else {
      super();
    }
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
  static async findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null> {
    return Ticket.findOne({
      _id: event.id,
      version: event.version - 1,
    });
  }
}
