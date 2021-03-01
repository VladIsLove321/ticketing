import {
  Publisher,
  OrderCancelledEvent,
  Subject,
} from "@vladislovetickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subject.OrderCancelled;
}
