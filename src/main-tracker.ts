import { merge, timer, fromEvent } from "rxjs";
import {
  variationsInViewport$,
  initIntersectionObserver,
  VariationsInViewport
} from "./events/variationsInViewport";
import { mouseDistance$, MouseDistance } from "./events/mouseDistance";
import { pageScrolling$, PageScrolling } from "./events/pageScrolling";
import { timeOnSite$, TimeOnSite } from "./events/timeOnSite";
import { rapidClicking$, RapidClicking } from "./events/rapidClicking";
import {
  orientationChange$,
  OrientationChange
} from "./events/orientationChange";
import { Outcome, outcome$, Metadata } from "./events/outcome";
import { pageView$, PageView } from "./events/pageView";
import { timeOnPage$, TimeOnPage } from "./events/timeOnPage";
import { retryWhen, switchMap, tap, repeat } from "rxjs/operators";
import { webSocket } from "rxjs/webSocket";
import { event$ } from "./publicEventsSubject";
import { now } from "./libs/now";
import { Buffer } from "./libs/buffer";
import {
  variationMousedown$,
  VariationMousedown
} from "./events/variationMousedown";
import {
  caughtErrors$,
  CaughtErrorMetadata,
  CaughtError
} from "./events/caughtError";

export type Config = {
  projectId: string;
  vid?: string; // maybe we can default to a cookie we set and then let an override be passed in?
  rid?: string; // maybe we need to create this client side if user does not supply it
  startTimestamp?: number; // this as well client side if not supplied
  apiKey: string;
};

export type Action =
  | CaughtError
  | MouseDistance
  | OrientationChange
  | Outcome
  | PageScrolling
  | PageView
  | RapidClicking
  | TimeOnPage
  | TimeOnSite
  | VariationMousedown
  | VariationsInViewport;

export const initTracker = (
  { projectId, vid, rid, startTimestamp, apiKey }: Config,
  WS_FQDN = "wss://analytics.digitaloptgroup.com" // this should havea version - analytics-v1.digitaloptgroup.com
) => {
  // set up socket url
  const SOCKET_URL = `${WS_FQDN}?apiKey=${apiKey}&rid=${rid}&vid=${vid}&startTimestamp=${startTimestamp}&projectId=${projectId}`;
  const BUFFER_SIZE = 1000;
  let wsOnline = false;
  // set up circular buffer with size of BUFFER_SIZE
  const buffer = new Buffer<Action>(BUFFER_SIZE);

  const ws$ = webSocket({
    url: SOCKET_URL,
    closeObserver: {
      next: () => {
        wsOnline = false;
      }
    },
    openObserver: {
      next: () => {
        wsOnline = true;
        if (buffer.length > 0) {
          for (let i = 0, l = buffer.length; i < l; i++) {
            ws$.next(buffer.get(i));
          }

          buffer.clear();
        }
      }
    }
  });

  // start the websocket connection
  ws$
    .pipe(
      retryWhen(error$ => {
        return error$.pipe(
          switchMap(e => {
            // events$.next({
            //   type: "CAUGHT_ERROR",
            //   metadata,
            //   elapsedTime: now()
            // })
            return navigator.onLine === true
              ? timer(1000)
              : fromEvent(document.body, "online");
          })
        );
      }),
      tap({
        next: (x: any) => {
          if (process.env.NODE_ENV !== "production") {
            console.log("From server", x);
          }
        },
        complete() {
          // do logging
        }
      }),
      // if this completes we should reconnect
      repeat()
    )
    .subscribe();

  // wire up event buffer and sending
  merge<Action>(
    caughtErrors$,
    mouseDistance$,
    pageScrolling$,
    orientationChange$,
    outcome$,
    pageView$,
    rapidClicking$,
    timeOnPage$,
    timeOnSite$,
    variationMousedown$,
    variationsInViewport$
  )
    // should we be catching errors here?
    .subscribe(event => {
      if (wsOnline === true) {
        ws$.next(event);
      } else {
        buffer.push(event);
      }
    });

  return {
    pathChange: (pathname: string) =>
      event$.next({
        type: "PATH_CHANGE",
        pathname,
        elapsedTime: now()
      }),
    outcome: (outcome: string, metadata: Metadata[]) =>
      event$.next({
        type: "OUTCOME",
        outcome,
        metadata,
        elapsedTime: now()
      }),
    caughtError: (metadata: CaughtErrorMetadata[]) =>
      event$.next({
        type: "CAUGHT_ERROR",
        metadata,
        elapsedTime: now()
      }),
    initIntersectionObserver: initIntersectionObserver
  };
};

/*
Could also offer: 
- configuration for the interval timers 
- configuration for sampling -> either by RID or VID
*/
