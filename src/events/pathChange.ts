import { filter } from "rxjs/operators";
import { event$, PublicAction } from "../publicEventsSubject";

export type PathChange = {
  type: "PATH_CHANGE";
  pathname: string;
  elapsedTime: number;
};

export const pathChange$ = event$.pipe(
  filter(
    (event: PublicAction): event is PathChange => event.type === "PATH_CHANGE"
  )
);
// see this discussion on type guards: https://github.com/Microsoft/TypeScript/issues/16069
