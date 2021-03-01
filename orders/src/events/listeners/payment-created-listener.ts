import {
  GroupName,
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subject,
} from "@vladislovetickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subject.PaymentCreated;
  groupName = GroupName.OrdersService;
  onMessage = async (data: PaymentCreatedEvent["data"], msg: Message) => {
    const { orderId } = data;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("order not found");
    }
    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();
    msg.ack();
  };
}
