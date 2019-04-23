import { merge } from "rxjs";
import { switchMap, map, filter, bufferTime } from "rxjs/operators";
import { pathChange$ } from "./pathChange";
import { now } from "../libs/now";
import { scrollDistance$ } from "./scrollDistance";
import { scrollDepth$ } from "./scrollDepth";

export type PageScrolling = {
  type: "PAGE_SCROLLING";
  distance: number;
  depth: number;
  pathname: string;
  elapsedTime: number;
};

export const pageScrolling$ = pathChange$.pipe(
  // start this new when the path changes
  switchMap(({ pathname }) => {
    return merge(scrollDistance$, scrollDepth$).pipe(
      bufferTime(3000),
      filter(array => array.length > 0),
      map(array => {
        return array.reduce(
          (acc, item) => {
            if (item.type === "SCROLL_DISTANCE") {
              // total absolute scroll distance for 3 second window
              return { ...acc, distance: acc.distance + item.distance };
            } else if (item.type === "SCROLL_DEPTH") {
              // max scroll depth during 3 second window
              return { ...acc, depth: Math.max(acc.depth, item.depth) };
            } else {
              throw Error(
                "types in pageScrolling$ reduce() didn't match SCROLL_DISTANCE nor SCROLL_DEPTH"
              );
            }
          },
          { depth: 0, distance: 0 }
        );
      }),
      map(
        ({ depth, distance }): PageScrolling => {
          return {
            type: "PAGE_SCROLLING",
            distance,
            depth,
            pathname,
            elapsedTime: now()
          };
        }
      )
    );
  })
);
