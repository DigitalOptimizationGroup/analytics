import { sampleTime, pairwise, bufferTime, filter, map } from "rxjs/operators";
import { mouseMove$ } from "../libs/mouse";
import { now } from "../libs/now";
import { fromEvent } from "rxjs";

export type MouseDistance = {
  type: "MOUSE_DISTANCE";
  elapsedTime: number;
  distance: number;
};

// this will emit the last 3 seconds of euclidean mouse movement
// with mousemovement sampled every 250 ms
export const mouseDistance$ = fromEvent<MouseEvent>(document, "mousemove").pipe(
  sampleTime(250),
  map(({ clientX, clientY }) => [clientX, clientY]),
  pairwise(),
  map(
    ([acc, item]): number => {
      const a = acc[0] - item[0];
      const b = acc[1] - item[1];
      return Math.round(Math.sqrt(a * a + b * b));
    }
  ),
  bufferTime(3000), // could merge here with view, if it changes then emit
  filter(x => x.length > 0),
  map(array => array.reduce((acc, item) => acc + item, 0)),
  map(
    (distance): MouseDistance => {
      return {
        type: "MOUSE_DISTANCE",
        distance,
        elapsedTime: now()
      };
    }
  )
);
