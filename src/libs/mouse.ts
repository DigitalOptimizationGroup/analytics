import { fromEvent } from "rxjs";

export const mouseMove$ = fromEvent<MouseEvent>(document, "mousemove");

// export const touchMouseDown$ = merge(
//   fromEvent<MouseEvent>(window, "mousedown")
//   //Observable.fromEvent(window, "touchstart")
// )
//   // these may both emit on some devices, debouncing will only take one
//   //.debounceTime(75)
//   .pipe(
//     map(event => {
//       return {
//         clientX: event.clientX,
//         clientY: event.clientY,
//         innerHTML: (event.target as Element).innerHTML
//       };
//     }),
//     share()
//   );

/*
This is not the most robust implementation for touch and mouse

touchstart contains an array of touch points, so this needs more work to be meaningful for touch

  https://www.html5rocks.com/en/mobile/touchandmouse/

  https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html#//apple_ref/doc/uid/TP40006511-SW6
*/
