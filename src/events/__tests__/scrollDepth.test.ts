import { take } from "rxjs/operators";
import { scrollDepth$ } from "../scrollDepth";
import { TestScheduler } from "rxjs/testing";
import { setPerformanceNow } from "../../__helpers__/setPerformanceNow";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Pulls out scroll depth from scroll events", () => {
  const scheduler = new TestScheduler(assertDeepEqual);

  scheduler.run(helpers => {
    helpers.cold("-a").subscribe(() => {
      Object.defineProperty(document, "body", {
        configurable: true,
        get() {
          return { scrollHeight: 2500, offsetHeight: 2500 };
        }
      });
      Object.defineProperty(window, "pageYOffset", {
        configurable: true,
        get() {
          return 475;
        }
      });
      setPerformanceNow(1000);
      window.dispatchEvent(new UIEvent("scroll"));
    });

    helpers.expectObservable(scrollDepth$.pipe(take(1))).toBe("251ms (a|)", {
      a: {
        type: "SCROLL_DEPTH",
        depth: 0.4972,
        elapsedTime: 1000
      }
    });
  });
});
