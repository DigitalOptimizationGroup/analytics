import { take } from "rxjs/operators";
import { pathChange$ } from "../pathChange";
import { TestScheduler } from "rxjs/testing";
import { event$ } from "../../publicEventsSubject";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Gets a page event", () => {
  const scheduler = new TestScheduler(assertDeepEqual);

  scheduler.run(helpers => {
    helpers.cold("-1s").subscribe(() => {
      event$.next({
        type: "PATH_CHANGE",
        pathname: "/about-us",
        elapsedTime: 1000
      });
    });

    helpers.expectObservable(pathChange$.pipe(take(1))).toBe("-(a|)", {
      a: {
        type: "PATH_CHANGE",
        pathname: "/about-us",
        elapsedTime: 1000
      }
    });
  });
});
