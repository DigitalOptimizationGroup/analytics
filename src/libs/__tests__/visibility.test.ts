import { take } from "rxjs/operators";
import { visibility$ } from "../visibility";
import { TestScheduler } from "rxjs/testing";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Listens to visibilitychange and emits on change", () => {
  const scheduler = new TestScheduler(assertDeepEqual);

  scheduler.run(helpers => {
    helpers.cold("- (a|)").subscribe(() => {
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get() {
          return "hidden";
        }
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    helpers.expectObservable(visibility$.pipe(take(2))).toBe("a (b|)", {
      a: { visibility: "visible" },
      b: { visibility: "hidden" }
    });
  });
});

it("Handles no browser support", done => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get() {
      return undefined;
    }
  });

  visibility$.pipe(take(1)).subscribe(value => {
    expect(value).toEqual({
      visibility: "noBrowserSupport"
    });
    done();
  });
});
