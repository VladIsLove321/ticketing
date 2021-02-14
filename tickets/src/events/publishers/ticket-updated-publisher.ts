import { Publisher, Subject, TicketUpdated } from "@vladislovetickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdated> {
  readonly subject = Subject.TicketUpdated;
}
