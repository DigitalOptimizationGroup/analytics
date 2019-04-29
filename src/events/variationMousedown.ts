import { fromEvent } from "rxjs";
import { map, filter } from "rxjs/operators";
import { now } from "../libs/now";
import { observedElementMetadata } from "./variationsInViewport";

export type VariationMousedown = {
  type: "VARIATION_MOUSEDOWN";
  elapsedTime: number;
  releaseId: string;
  featureId: string;
  variationId: string;
  exposureId: string;
};

// if (!Element.prototype.matches) {
//   Element.prototype.matches = Element.prototype.webkitMatchesSelector;
// }

// if (!Element.prototype.closest) {
//   Element.prototype.closest = function(s) {
//     var el = this;

//     do {
//       if (el.matches(s)) return el;
//       el = el.parentElement || el.parentNode;
//     } while (el !== null && el.nodeType === 1);
//     return null;
//   };
// }

export const variationMousedown$ = fromEvent<MouseEvent>(
  window,
  "mousedown"
).pipe(
  map(event => {
    if (event.target instanceof HTMLElement) {
      const dataset = observedElementMetadata.get(event.target);

      if (dataset) {
        return {
          type: "VARIATION_MOUSEDOWN",
          elapsedTime: now(),
          releaseId: dataset.releaseId,
          featureId: dataset.featureId,
          variationId: dataset.variationId,
          exposureId: dataset.exposureId
        };
      }
    }
  }),
  filter(event => event !== undefined)
);
