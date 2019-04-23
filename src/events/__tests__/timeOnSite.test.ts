import { take } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";
import { event$ } from "../../publicEventsSubject";
import { timeOnSite$ } from "../timeOnSite";
import { interval } from "rxjs";
import { setPerformanceNow } from "../../__helpers__/setPerformanceNow";
import { now } from "../../libs/now";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Emits time invervals for the current request", () => {
  const scheduler = new TestScheduler(assertDeepEqual);

  scheduler.run(helpers => {
    // mock progression of time
    interval(1000)
      .pipe(take(20))
      .subscribe(i => {
        setPerformanceNow((i + 1) * 1000);
        if (i === 12) {
          // change visibility state to hidden
          Object.defineProperty(document, "visibilityState", {
            configurable: true,
            get() {
              return "hidden";
            }
          });
          document.dispatchEvent(new Event("visibilitychange"));
        }
      });

    helpers
      .cold("1s a 5s b", {
        a: { pathname: "/about-us" },
        b: { pathname: "/product-one" }
      })
      .subscribe(({ pathname }) => {
        event$.next({
          type: "PATH_CHANGE",
          pathname,
          elapsedTime: now()
        });
      });

    helpers
      .expectObservable(timeOnSite$.pipe(take(7)))
      .toBe("1s a 999ms b 999ms c 1999ms d 3999ms e 4999ms f 999ms (g|)", {
        a: {
          type: "TIME_ON_SITE",
          elapsedInterval: 1,
          elapsedTime: 1000,
          visibility: "visible"
        },
        b: {
          type: "TIME_ON_SITE",
          elapsedInterval: 1,
          elapsedTime: 2000,
          visibility: "visible"
        },
        c: {
          type: "TIME_ON_SITE",
          elapsedInterval: 1,
          elapsedTime: 3000,
          visibility: "visible"
        },
        d: {
          type: "TIME_ON_SITE",
          elapsedInterval: 2,
          elapsedTime: 5000,
          visibility: "visible"
        },
        e: {
          type: "TIME_ON_SITE",
          elapsedInterval: 4,
          elapsedTime: 9000,
          visibility: "visible"
        },
        // when visibility changes, it starts counting intervals from 1 again
        f: {
          type: "TIME_ON_SITE",
          elapsedInterval: 1,
          elapsedTime: 13000,
          visibility: "hidden"
        },
        g: {
          type: "TIME_ON_SITE",
          elapsedInterval: 1,
          elapsedTime: 14000,
          visibility: "hidden"
        }
      });
  });
});
