import { Message } from "node-nats-streaming";
import {
  Subject,
  Listener,
  TicketUpdated,
  GroupName,
} from "@vladislovetickets/common";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdated> {
  readonly subject = Subject.TicketUpdated;
  groupName = GroupName.OrdersService;
  async onMessage(data: TicketUpdated["data"], msg: Message) {
    const { title, price, version } = data;
    const ticket = await Ticket.findByEvent(data);
    if (!ticket) {
      throw new Error("ticket not found");
    }
    ticket.set({
      title,
      price,
      version,
    });
    await ticket.save();
    msg.ack();
  }
}
