import { take } from "rxjs/operators";
import { mouseDistance$ } from "../mouseDistance";
import { TestScheduler } from "rxjs/testing";
import { setPerformanceNow } from "../../__helpers__/setPerformanceNow";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

jest.mock("../../libs/now", () => {
  let time = 0;
  return {
    now() {
      time++;
      return time;
    }
  };
});

it("Calculates total mouse distance from mouseevents", () => {
  const scheduler = new TestScheduler(assertDeepEqual);

  scheduler.run(helpers => {
    // we use the cold helper to control the progression of time within rxjs
    // this will run synchronously, but rxjs will treat it as if time progressed
    // the cold observable allows us to dispatch mouse events across time
    // document.dispatchEvent behaves synchronously so everything just works
    helpers
      .cold("-a 1000ms b 1000ms c 1000ms d 1000ms e 1000ms f", {
        a: new MouseEvent("mousemove", { clientX: 2, clientY: 3 }),
        b: new MouseEvent("mousemove", { clientX: 3, clientY: 5 }),
        c: new MouseEvent("mousemove", { clientX: 7, clientY: 9 }),
        d: new MouseEvent("mousemove", { clientX: 3, clientY: 3 }),
        e: new MouseEvent("mousemove", { clientX: 8, clientY: 7 }),
        f: new MouseEvent("mousemove", { clientX: 6, clientY: 3 })
      })
      .subscribe(event => {
        document.dispatchEvent(event);
      });

    const result = mouseDistance$.pipe(take(2));

    helpers.expectObservable(result).toBe("3000ms w 2999ms (x|)", {
      w: {
        distance: 8,
        elapsedTime: 1,
        type: "MOUSE_DISTANCE"
      },
      x: {
        distance: 17,
        elapsedTime: 2,
        type: "MOUSE_DISTANCE"
      }
    });
  });
});
