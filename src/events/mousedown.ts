import { fromEvent } from "rxjs";
import { map } from "rxjs/operators";
import { now } from "../libs/now";

export type Mousedown = {
  type: "MOUSE_DOWN";
  elapsedTime: number;
  clientX: number;
  clientY: number;
  innerHTML: string;
};

export const mousedown$ = fromEvent<MouseEvent>(window, "mousedown").pipe(
  map(
    (event): Mousedown => {
      return {
        type: "MOUSE_DOWN",
        clientX: event.clientX,
        clientY: event.clientY,
        innerHTML: (event.target as Element).innerHTML,
        elapsedTime: now()
      };
    }
  )
);
