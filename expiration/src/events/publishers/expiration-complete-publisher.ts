import {
  ExpirationCompleteEvent,
  Publisher,
  Subject,
} from "@vladislovetickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subject.ExpirationComplete;
}
