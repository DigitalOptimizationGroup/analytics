import { interval } from "rxjs";
import { switchMap, throttle, map, timeInterval } from "rxjs/operators";
import { visibility$ } from "./visibility";

/*
Emits the elapsedInterval in seconds since the last event was emitted
*/
export const exponentialIntervalTimer$ = visibility$.pipe(
  switchMap(({ visibility }) =>
    interval(1000).pipe(
      // exponential throttling
      throttle(t => {
        // if we switch to a websocket we may do away with this interval
        return interval(t * 1000);
      }),
      //.takeWhile(t => t <= maxTime) // might implement in the future
      timeInterval(), // time passed since last emission
      map(({ interval }) => ({
        visibility,
        elapsedInterval: Math.round(interval / 1000)
      }))
    )
  )
);
