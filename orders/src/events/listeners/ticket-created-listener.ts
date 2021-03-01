import { Message } from "node-nats-streaming";
import {
  Listener,
  TicketCreatedEvent,
  Subject,
  GroupName,
} from "@vladislovetickets/common";
import { Ticket } from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subject.TicketCreated;
  groupName = GroupName.OrdersService;
  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { id, title, price, version } = data;
    const ticket = new Ticket({
      id,
      title,
      price,
      version,
    });
    await ticket.save();
    msg.ack();
  }
}
