import { PathChange } from "./events/pathChange";
import { Outcome } from "./events/outcome";
import { VariationIntersection } from "./events/variationsInViewport";
import { CaughtError } from "./events/caughtError";
import { Subject } from "rxjs";

export type PublicAction =
  | PathChange
  | Outcome
  | VariationIntersection
  | CaughtError;

export const event$ = new Subject<PublicAction>();
