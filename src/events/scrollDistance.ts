import { map, pluck, pairwise } from "rxjs/operators";
import { scrollEvent$ } from "../libs/scrolling";
import { now } from "../libs/now";

export type ScrollDistance = {
  type: "SCROLL_DISTANCE";
  distance: number;
  elapsedTime: number;
};

// this calculates the absolute scoll distance between two scoll events
export const scrollDistance$ = scrollEvent$.pipe(
  pluck("scrollTop"),
  pairwise(),
  map(([a, b]) => Math.abs(a - b)),
  map(
    (distance): ScrollDistance => {
      return {
        type: "SCROLL_DISTANCE",
        distance,
        elapsedTime: now()
      };
    }
  )
);
