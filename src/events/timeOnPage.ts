import { switchMap, map } from "rxjs/operators";
import { pathChange$ } from "./pathChange";
import { exponentialIntervalTimer$ } from "../libs/exponentialIntervalTimer";
import { now } from "../libs/now";
import { Visibility } from "../libs/visibility";

export type TimeOnPage = {
  type: "TIME_ON_PAGE";
  elapsedInterval: number;
  visibility: Visibility;
  pathname: string;
  elapsedTime: number;
};

// time on page, on route change disposes of inner observable and begins new count
export const timeOnPage$ = pathChange$.pipe(
  switchMap(({ pathname }) => {
    return exponentialIntervalTimer$.pipe(
      map(
        ({ elapsedInterval, visibility }): TimeOnPage => {
          return {
            // many elapsedInterval events can be summed together to give
            // total time on page from any elapsedTime mark forward
            // this is useful for calculating the time on a page after a given event
            type: "TIME_ON_PAGE",
            elapsedInterval,
            visibility,
            pathname,
            elapsedTime: now()
          };
        }
      )
    );
  })
);
