import {
  PaymentCreatedEvent,
  Publisher,
  Subject,
} from "@vladislovetickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subject.PaymentCreated;
}
