import {
  Publisher,
  OrderCreatedEvent,
  Subject,
} from "@vladislovetickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subject.OrderCreated;
}
