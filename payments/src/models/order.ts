import { OrderStatus } from "@vladislovetickets/common";
import { Document, model, Schema } from "mongoose";

interface OrdersAttrs {
  id?: string;
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

type OrderDoc = Document & OrdersAttrs;

const orderSchema = new Schema<OrderDoc>(
  {
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
    },
    userId: {
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

const OrderModel = model<OrderDoc>("Order", orderSchema);

export class Order extends OrderModel {
  constructor(attrs: OrdersAttrs | undefined) {
    if (attrs) {
      const { id, ...rest } = attrs;
      super({ _id: id, ...rest });
    } else {
      super();
    }
  }
}
