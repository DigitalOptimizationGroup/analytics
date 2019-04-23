import { take } from "rxjs/operators";
import { pageScrolling$ } from "../pageScrolling";
import { TestScheduler } from "rxjs/testing";
import { event$ } from "../../publicEventsSubject";
import { interval } from "rxjs";
import { setPerformanceNow } from "../../__helpers__/setPerformanceNow";
import { now } from "../../libs/now";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Calculated scroll distance and depth by path change", () => {
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
        Object.defineProperty(window, "pageYOffset", {
          configurable: true,
          get() {
            // we don't want to mock scrolling further than actually possible
            return Math.min(i * 100, 2500 - window.innerHeight);
          }
        });
        setPerformanceNow(i * 500);
        window.dispatchEvent(new UIEvent("scroll"));
      });

    helpers
      .expectObservable(pageScrolling$.pipe(take(3)))
      .toBe("4s a 5000ms b 2999ms (c|)", {
        a: {
          type: "PAGE_SCROLLING",
          depth: 0.5472,
          distance: 500,
          elapsedTime: 3000,
          pathname: "/about-us"
        },
        b: {
          type: "PAGE_SCROLLING",
          depth: 0.9472,
          distance: 400,
          elapsedTime: 8500,
          pathname: "/product-one"
        },
        c: {
          type: "PAGE_SCROLLING",
          depth: 1,
          distance: 132,
          elapsedTime: 9500,
          pathname: "/product-one"
        }
      });
  });
});
