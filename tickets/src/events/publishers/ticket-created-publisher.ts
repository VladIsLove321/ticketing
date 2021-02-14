import {
  Publisher,
  Subject,
  TicketCreatedEvent,
} from "@vladislovetickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subject.TicketCreated;
}
