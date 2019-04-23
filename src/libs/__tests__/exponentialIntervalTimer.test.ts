import { exponentialIntervalTimer$ } from "../exponentialIntervalTimer";
import { TestScheduler } from "rxjs/testing";
import { take } from "rxjs/operators";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Emits exponentially longer and longer time intervals", () => {
  const scheduler = new TestScheduler(assertDeepEqual);
  scheduler.run(helpers => {
    helpers
      .expectObservable(exponentialIntervalTimer$.pipe(take(5)))
      .toBe("1s a 999ms b 999ms c 1999ms d 3999ms (e|)", {
        a: { elapsedInterval: 1, visibility: "visible" },
        b: { elapsedInterval: 1, visibility: "visible" },
        c: { elapsedInterval: 1, visibility: "visible" },
        d: { elapsedInterval: 2, visibility: "visible" },
        e: { elapsedInterval: 4, visibility: "visible" }
      });
  });
});
