import { Document, model, Schema } from "mongoose";
import { OrderStatus } from "@vladislovetickets/common";
import { TicketDoc } from "./ticket";

export { OrderStatus };

interface OrderInterface {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

type OrderDoc = Document & OrderInterface;

const orderSchema = new Schema<OrderDoc>(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: Schema.Types.Date,
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

const OrderModel = model<OrderDoc>("Order", orderSchema);

export class Order extends OrderModel {
  constructor(attrs: OrderInterface) {
    super(attrs);
  }
}
