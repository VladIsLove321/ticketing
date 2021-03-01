import {
  GroupName,
  Listener,
  OrderCancelledEvent,
  OrderStatus,
  Subject,
} from "@vladislovetickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subject.OrderCancelled;
  groupName = GroupName.PaymentsService;
  onMessage = async (data: OrderCancelledEvent["data"], msg: Message) => {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });
    if (!order) {
      throw new Error("Order not found");
    }
    order.set({
      version: data.version,
      status: OrderStatus.Cancelled,
    });
    await order.save();
    msg.ack();
  };
}
