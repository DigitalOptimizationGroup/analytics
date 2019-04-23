import { fromEvent } from "rxjs";
import { map } from "rxjs/operators";
import { now } from "../libs/now";

export type OrientationChange = {
  type: "ORIENTATION_CHANGE";
  elapsedTime: number;
  orientationAngle: number;
};

export const orientationChange$ = fromEvent(window, "orientationchange").pipe(
  map(
    (): OrientationChange => {
      return {
        type: "ORIENTATION_CHANGE",
        elapsedTime: now(),
        orientationAngle: window.screen.orientation.angle
      };
    }
  )
);
