import { take } from "rxjs/operators";
import { pageView$ } from "../pageView";
import { TestScheduler } from "rxjs/testing";
import { event$ } from "../../publicEventsSubject";
import { interval } from "rxjs";
import { setPerformanceNow } from "../../__helpers__/setPerformanceNow";
import { now } from "../../libs/now";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Emits page view events", () => {
  const scheduler = new TestScheduler(assertDeepEqual);

  scheduler.run(helpers => {
    // set the document height needed to calculate scroll depth
    Object.defineProperty(document, "body", {
      configurable: true,
      get() {
        return { scrollHeight: 2500, offsetHeight: 2500 };
      }
    });

    Object.defineProperty(window, "pageYOffset", {
      configurable: true,
      get() {
        // we don't want to mock scrolling further than actually possible
        return 0;
      }
    });

    // mock progression of elapsedTime
    interval(500)
      .pipe(take(20))
      .subscribe(i => {
        setPerformanceNow((i + 1) * 500);
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

    helpers.expectObservable(pageView$.pipe(take(2))).toBe("1s a 5s (b|)", {
      a: {
        type: "PAGE_VIEW",
        documentHeight: 2500,
        elapsedTime: 500,
        entryDepth: 0.3072,
        pathname: "/about-us",
        scrollTopOnEntry: 0,
        viewportHeight: 768,
        viewportWidth: 1024
      },
      b: {
        type: "PAGE_VIEW",
        documentHeight: 2500,
        elapsedTime: 6000,
        entryDepth: 0.3072,
        pathname: "/product-one",
        scrollTopOnEntry: 0,
        viewportHeight: 768,
        viewportWidth: 1024
      }
    });
  });
});
