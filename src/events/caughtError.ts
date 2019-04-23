import { filter } from "rxjs/operators";
import { event$, PublicAction } from "../publicEventsSubject";

export type CaughtErrorMetadata = { key: string; value: string };

export type CaughtError = {
  type: "CAUGHT_ERROR";
  elapsedTime: number;
  metadata: CaughtErrorMetadata[];
};

export const caughtErrors$ = event$.pipe(
  filter(
    (event: PublicAction): event is CaughtError => event.type === "CAUGHT_ERROR"
  )
);
