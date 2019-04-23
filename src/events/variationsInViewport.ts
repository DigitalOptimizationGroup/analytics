import { switchMap, map, debounceTime, scan, filter } from "rxjs/operators";
import { exponentialIntervalTimer$ } from "../libs/exponentialIntervalTimer";
import { event$, PublicAction } from "../publicEventsSubject";
import { now } from "../libs/now";

// intersection observer pollyfill
require("intersection-observer");
// alternatively we use this? <script src="https://polyfill.io/v2/polyfill.min.js?features=IntersectionObserver"></script>

// these are events from the DOM Intersection Observer API, they may or may not be in the viewport
export type VariationIntersection = {
  type: "VARIATION_INTERSECTION";
  releaseId: string;
  featureId: string;
  variationId: string;
  exposureId: string;
  elapsedTime: number;
  intersectionRatio: number;
  isIntersecting: boolean;
  position: number;
};

// these are filtered variations that are in the viewport
export type VariationsInViewport = {
  type: "VARIATIONS_IN_VIEWPORT";
  currentlyIntersectingVariations: VariationIntersection[];
  elapsedInterval: number;
  visibility: VisibilityState | "noBrowserSupport";
  elapsedTime: number;
};

export const variationsInViewport$ = event$.pipe(
  filter(
    (event: PublicAction): event is VariationIntersection =>
      event.type === "VARIATION_INTERSECTION"
  ),
  scan(
    (
      currentlyIntersectingVariations: Array<VariationIntersection>,
      variationIntersection: VariationIntersection
    ) => {
      return [
        // filter out the variationIntersection if it is in our accumlator, we'll either replace it or remove it completely
        ...currentlyIntersectingVariations.filter(
          variation => variation.exposureId !== variationIntersection.exposureId
        ),
        // if the variationIntersection is currently intersecting, then add it (back or newly) to our accumlator
        ...(variationIntersection.isIntersecting === true
          ? [variationIntersection]
          : [])
      ];
    },
    []
  ),
  debounceTime(500),
  filter(
    currentlyIntersectingVariations =>
      currentlyIntersectingVariations.length > 0
  ),
  switchMap((currentlyIntersectingVariations: Array<VariationIntersection>) => {
    // every time there is a change in to our currentlyIntersectingVariations we start a new exponential timer
    return exponentialIntervalTimer$.pipe(
      map(
        ({ elapsedInterval, visibility }): VariationsInViewport => {
          return {
            type: "VARIATIONS_IN_VIEWPORT",
            currentlyIntersectingVariations,
            elapsedInterval,
            visibility,
            elapsedTime: now()
          };
        }
      )
    );
  })
);

let observerOptions = {
  // from: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver
  /*
    A specific ancestor of the target element being observed. 
    If no value was passed to the constructor or this is null, 
    the top-level document's viewport is used.
  */
  root: null,

  /*
    An offset rectangle applied to the root's bounding box when 
    calculating intersections, effectively shrinking or growing 
    the root for calculation purposes. The value returned by this 
    property may not be the same as the one specified when calling 
    the constructor as it may be changed to match internal requirements. 
    Each offset can be expressed in pixels (px) or as a percentage (%). 
    The default is "0px 0px 0px 0px".
  */
  rootMargin: "0px 0px 0px 0px",

  /*
    A list of thresholds, sorted in increasing numeric order, 
    where each threshold is a ratio of intersection area to 
    bounding box area of an observed target. Notifications for 
    a target are generated when any of the thresholds are crossed 
    for that target. If no value was passed to the constructor, 
    0 is used.
  */
  // this will fire an event at each threshold, entering and leaving the viewport
  // could query something like SUM(Select elapsedInterval FROM table WHERE intersectionRate > .5) GROUP BY RID exposureId
  threshold: [0, 0.25, 0.75, 1]
};

// pass an element and metadata
// if the variation is bigger than the viewport we might not be able to know that it was scrolled all the
// way through the whole thing without somehow combining it with scroll events - TODO
// could look at height & width and scrollTop and then calculate the amount of the variation scroll depth
// maybe it's not actually "intersectionRatio" that we want to see, but rather scrollDepth - if an item is
// small this would likely hit 1 almost immeditately. But if it were taller it might take some time.
// lots of permutations here to really find out how much of it has passed through the viewport - this is just a start
/*
        could also save event.intersectionRect
          {
            bottom: 387;
            height: 387;
            left: 8;
            right: 308;
            top: 0;
            width: 300;
            x: 8;
            y: 0;
          }
      */

type TrackingData = {
  releaseId: string;
  featureId: string;
  variationId: string;
  exposureId: string;
  position: number;
};

export const observedElementMetadata = new WeakMap<Element, TrackingData>();

export const initIntersectionObserver = () => {
  const intersectionCallback = (entries: Array<IntersectionObserverEntry>) => {
    entries.forEach(entry => {
      const dataset = observedElementMetadata.get(entry.target);

      event$.next({
        type: "VARIATION_INTERSECTION",
        isIntersecting: entry.isIntersecting,
        intersectionRatio: entry.intersectionRatio,
        releaseId: dataset.releaseId,
        featureId: dataset.featureId,
        variationId: dataset.variationId,
        exposureId: dataset.exposureId, // can be used as variationId.headline
        elapsedTime: Math.round(entry.time),
        position: dataset.position || 1
      });
    });
  };

  const intersectionObserver = new IntersectionObserver(
    intersectionCallback,
    observerOptions
  );

  const observe = (element: HTMLElement, _ab: TrackingData) => {
    if (
      !_ab ||
      !_ab.releaseId ||
      !_ab.featureId ||
      !_ab.variationId ||
      !_ab.exposureId
    ) {
      throw Error(
        `Observe must be called with proper tracking. The element was ${
          element.innerHTML
        } and tracking was ${JSON.stringify(_ab)}`
      );
    }

    observedElementMetadata.set(element, _ab);
    intersectionObserver.observe(element);
  };

  const unobserve = (element: HTMLElement) => {
    observedElementMetadata.delete(element);
    intersectionObserver.unobserve(element);
  };

  return { observe, unobserve };
};
