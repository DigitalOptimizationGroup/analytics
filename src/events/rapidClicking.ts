import { scan, filter, debounceTime, map } from "rxjs/operators";
import { mousedown$, Mousedown } from "./mousedown";
import { now } from "../libs/now";

export type RapidClicking = {
  type: "RAPID_CLICKING";
  count: number;
  clientX: number;
  clientY: number;
  innerHTML: string;
  elapsedTime: number;
};

export const rapidClicking$ = mousedown$.pipe(
  scan(
    (
      acc: {
        count: number;
        clientX: number;
        clientY: number;
        innerHTML: string;
      },
      event: Mousedown
    ) => {
      const pixelsMoved = Math.round(
        Math.sqrt(
          Math.pow(event.clientY - acc.clientY, 2) +
            Math.pow(event.clientX - acc.clientX, 2)
        )
      );
      return {
        clientX: event.clientX,
        clientY: event.clientY,
        innerHTML: event.innerHTML,
        // if click is on the same target or less than 10 pixels away count it
        count: pixelsMoved < 11 ? acc.count + 1 : 1
      };
    },
    { count: 1, clientX: 0, clientY: 0, innerHTML: "" }
  ),
  // if we remove this filter this could be a global click tracker with rage clicking built in
  // we could just look up variation data and add that if it exists
  filter(({ count }) => count > 1),
  debounceTime(300),
  map(
    ({ count, innerHTML, clientY, clientX }): RapidClicking => {
      return {
        type: "RAPID_CLICKING",
        count,
        innerHTML,
        clientX,
        clientY,
        elapsedTime: now()
      };
    }
  )
);
