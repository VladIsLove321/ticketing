import { Document, model, Schema } from "mongoose";

interface TicketInterface {
  title: string;
  price: number;
  userId: string;
}

type TicketDoc = Document & TicketInterface;

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
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
      versionKey: false,
    },
  }
);

const TicketModel = model<TicketDoc>("Ticket", ticketSchema);

export class Ticket extends TicketModel {
  constructor(attrs: TicketInterface) {
    super(attrs);
  }
}
