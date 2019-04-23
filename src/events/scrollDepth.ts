import { map, pluck } from "rxjs/operators";
import { scrollEvent$ } from "../libs/scrolling";
import { now } from "../libs/now";

export type ScrollDepth = {
  type: "SCROLL_DEPTH";
  depth: number;
  elapsedTime: number;
};

export const scrollDepth$ = scrollEvent$.pipe(
  pluck("depth"),
  map(
    (depth): ScrollDepth => {
      return {
        type: "SCROLL_DEPTH",
        depth,
        elapsedTime: now()
      };
    }
  )
);
