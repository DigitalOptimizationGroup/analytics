import { take } from "rxjs/operators";
import { scrollDistance$ } from "../scrollDistance";
import { TestScheduler } from "rxjs/testing";
import { setPerformanceNow } from "../../__helpers__/setPerformanceNow";
import { interval } from "rxjs";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Pulls out scroll distance and calculates absolute distance for last two events", () => {
  const scheduler = new TestScheduler(assertDeepEqual);

  scheduler.run(helpers => {
    interval(500)
      .pipe(take(2))
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
      .expectObservable(scrollDistance$.pipe(take(1)))
      .toBe("1250ms (a|)", {
        a: {
          type: "SCROLL_DISTANCE",
          distance: 100,
          elapsedTime: 500
        }
      });
  });
});
