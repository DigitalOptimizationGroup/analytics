import { take } from "rxjs/operators";
import { orientationChange$ } from "../orientationChange";
import { TestScheduler } from "rxjs/testing";
import { setPerformanceNow } from "../../__helpers__/setPerformanceNow";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Can subscribe to orientationChange$ and listen to orientationchange event", () => {
  const scheduler = new TestScheduler(assertDeepEqual);

  scheduler.run(helpers => {
    helpers
      .cold("-a-b-(c|)", { a: [0, 100], b: [90, 200], c: [0, 300] })
      .subscribe(([angle, time]) => {
        Object.defineProperty(window, "screen", {
          configurable: true,
          get() {
            return { orientation: { angle } };
          }
        });
        setPerformanceNow(time);
        window.dispatchEvent(new Event("orientationchange"));
      });

    helpers
      .expectObservable(orientationChange$.pipe(take(3)))
      .toBe("-a-b-(c|)", {
        a: {
          orientationAngle: 0,
          elapsedTime: 100,
          type: "ORIENTATION_CHANGE"
        },
        b: {
          orientationAngle: 90,
          elapsedTime: 200,
          type: "ORIENTATION_CHANGE"
        },
        c: { orientationAngle: 0, elapsedTime: 300, type: "ORIENTATION_CHANGE" }
      });
  });
});
