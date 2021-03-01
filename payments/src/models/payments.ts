import { Document, model, Schema } from "mongoose";

interface PaymentsAttrs {
  orderId: string;
  stripeId: string;
}

type PaymentDoc = { version: number } & Document & PaymentsAttrs;

const paymentSchema = new Schema<PaymentDoc>(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: "version",
    optimisticConcurrency: true,
    toJSON: {
      transform(doc, ret) {
        (ret.id = ret._id), delete ret._id;
      },
    },
  }
);

const PaymentModel = model<PaymentDoc>("Payment", paymentSchema);

export class Payment extends PaymentModel {
  constructor(attrs: PaymentsAttrs | undefined) {
    super(attrs);
  }
}
