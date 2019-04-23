import { take, map } from "rxjs/operators";
import { mouseMove$ } from "../mouse";
import { TestScheduler } from "rxjs/testing";
import { setPerformanceNow } from "../../__helpers__/setPerformanceNow";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Calculates total mouse distance from mouseevents", () => {
  const scheduler = new TestScheduler(assertDeepEqual);

  let now = 0;
  scheduler.run(helpers => {
    const mouseMoveEvent = new MouseEvent("mousemove", {
      clientX: 2,
      clientY: 3
    });
    helpers
      .cold("-a 1000ms a", {
        a: mouseMoveEvent
      })
      .subscribe(event => {
        setPerformanceNow(now++);
        document.dispatchEvent(event);
      });

    const result = mouseMove$.pipe(
      take(2),
      map(({ clientX, clientY }) => [clientX, clientY])
    );

    helpers.expectObservable(result).toBe("-w 1000ms (x|)", {
      w: [2, 3],
      x: [2, 3]
    });
  });
});
