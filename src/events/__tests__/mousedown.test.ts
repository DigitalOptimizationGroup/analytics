import { take } from "rxjs/operators";
import { mousedown$ } from "../mousedown";
import { TestScheduler } from "rxjs/testing";
import { setPerformanceNow } from "../../__helpers__/setPerformanceNow";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Basic mousedown event emits", () => {
  const scheduler = new TestScheduler(assertDeepEqual);

  scheduler.run(helpers => {
    helpers.cold("-a").subscribe(() => {
      setPerformanceNow(1000);
      window.dispatchEvent(
        new MouseEvent("mousedown", {
          clientX: 2,
          clientY: 3
        })
      );
    });

    helpers.expectObservable(mousedown$.pipe(take(1))).toBe("-(a|)", {
      a: {
        clientX: 2,
        clientY: 3,
        innerHTML: undefined,
        type: "MOUSE_DOWN",
        elapsedTime: 1000
      }
    });
  });
});
