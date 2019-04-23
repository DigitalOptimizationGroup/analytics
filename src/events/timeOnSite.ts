import { map } from "rxjs/operators";
import { exponentialIntervalTimer$ } from "../libs/exponentialIntervalTimer";
import { now } from "../libs/now";
import { Visibility } from "../libs/visibility";

export type TimeOnSite = {
  type: "TIME_ON_SITE";
  elapsedInterval: number;
  visibility: Visibility;
  elapsedTime: number;
};

// time on site event
export const timeOnSite$ = exponentialIntervalTimer$.pipe(
  map(
    (event): TimeOnSite => {
      return {
        type: "TIME_ON_SITE",
        elapsedInterval: Math.round(event.elapsedInterval),
        visibility: event.visibility,
        elapsedTime: now()
      };
    }
  )
);
