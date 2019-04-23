import { take } from "rxjs/operators";
import { rapidClicking$ } from "../rapidClicking";
import { TestScheduler } from "rxjs/testing";
import { setPerformanceNow } from "../../__helpers__/setPerformanceNow";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Calculates total mouse distance from mouseevents", () => {
  const scheduler = new TestScheduler(assertDeepEqual);

  scheduler.run(helpers => {
    helpers.cold("-a-a-a-a").subscribe(event => {
      window.dispatchEvent(
        new MouseEvent("mousedown", {
          clientX: 2,
          clientY: 3
        })
      );
    });

    setPerformanceNow(150);

    const result = rapidClicking$.pipe(take(1));

    helpers.expectObservable(result).toBe("307ms (x|)", {
      x: {
        type: "RAPID_CLICKING",
        clientX: 2,
        clientY: 3,
        count: 5,
        elapsedTime: 150,
        innerHTML: undefined
      }
    });
  });
});
