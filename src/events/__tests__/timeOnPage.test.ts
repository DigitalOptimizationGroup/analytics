import { take } from "rxjs/operators";
import { timeOnPage$ } from "../timeOnPage";
import { TestScheduler } from "rxjs/testing";
import { event$ } from "../../publicEventsSubject";
import { interval } from "rxjs";
import { setPerformanceNow } from "../../__helpers__/setPerformanceNow";
import { now } from "../../libs/now";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Emits time invervals for current page", () => {
  const scheduler = new TestScheduler(assertDeepEqual);

  scheduler.run(helpers => {
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

    // set the document height needed to calculate scroll depth
    Object.defineProperty(document, "body", {
      configurable: true,
      get() {
        return { scrollHeight: 2500, offsetHeight: 2500 };
      }
    });

    // mock scroll events
    interval(500)
      .pipe(take(20))
      .subscribe(i => {
        setPerformanceNow(i * 500);
      });

    helpers
      .expectObservable(timeOnPage$.pipe(take(6)))
      .toBe("2s a 999ms b 999ms c 1999ms d 1s e 999ms (f|)", {
        a: {
          type: "TIME_ON_PAGE",
          elapsedInterval: 1,
          elapsedTime: 1000,
          pathname: "/about-us",
          visibility: "visible"
        },
        b: {
          type: "TIME_ON_PAGE",
          elapsedInterval: 1,
          elapsedTime: 2000,
          pathname: "/about-us",
          visibility: "visible"
        },
        c: {
          type: "TIME_ON_PAGE",
          elapsedInterval: 1,
          elapsedTime: 3000,
          pathname: "/about-us",
          visibility: "visible"
        },
        d: {
          type: "TIME_ON_PAGE",
          elapsedInterval: 2,
          elapsedTime: 5000,
          pathname: "/about-us",
          visibility: "visible"
        },
        e: {
          type: "TIME_ON_PAGE",
          elapsedInterval: 1,
          elapsedTime: 6500,
          pathname: "/product-one",
          visibility: "visible"
        },
        f: {
          type: "TIME_ON_PAGE",
          elapsedInterval: 1,
          elapsedTime: 7500,
          pathname: "/product-one",
          visibility: "visible"
        }
      });
  });
});
