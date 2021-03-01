import { Document, model, Schema } from "mongoose";

interface TicketInterface {
  title: string;
  price: number;
  userId: string;
  orderId?: string;
}

type TicketDoc = Document &
  TicketInterface & {
    version: number;
  };

const ticketSchema = new Schema<TicketDoc>(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
    },
  },
  {
    optimisticConcurrency: true,
    versionKey: "version",
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const TicketModel = model<TicketDoc>("Ticket", ticketSchema);

export class Ticket extends TicketModel {
  constructor(attrs: TicketInterface) {
    super(attrs);
  }
}
