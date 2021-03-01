import {
  GroupName,
  Listener,
  OrderCreatedEvent,
  Subject,
} from "@vladislovetickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subject.OrderCreated;
  groupName = GroupName.PaymentsService;
  onMessage = async (data: OrderCreatedEvent["data"], msg: Message) => {
    const order = new Order({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });
    await order.save();
    msg.ack();
  };
}
