import { fromEvent } from "rxjs";
import { debounceTime, map, share } from "rxjs/operators";
import { getViewportDimensions } from "./getViewportDimensions";

// this get viewport dimentions for each scroll event
// maybe this should just use the native event
export const scrollEvent$ = fromEvent(window, "scroll").pipe(
  debounceTime(250),
  map(getViewportDimensions),
  share()
);
