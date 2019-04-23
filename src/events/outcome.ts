import { filter } from "rxjs/operators";
import { event$, PublicAction } from "../publicEventsSubject";

export type Metadata = { key: string; value: string };

export type Outcome = {
  type: "OUTCOME";
  elapsedTime: number;
  outcome: string;
  metadata: Metadata[];
};

export const outcome$ = event$.pipe(
  filter((event: PublicAction): event is Outcome => event.type === "OUTCOME")
);
