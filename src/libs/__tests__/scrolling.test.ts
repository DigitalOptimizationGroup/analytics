import { take } from "rxjs/operators";
import { scrollEvent$ } from "../scrolling";
import { TestScheduler } from "rxjs/testing";

const assertDeepEqual = (actual: any, expected: any) =>
  expect(actual).toEqual(expected);

it("Basic scrolling event emits viewport dimensions", () => {
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
      window.dispatchEvent(new UIEvent("scroll"));
    });

    helpers.expectObservable(scrollEvent$.pipe(take(1))).toBe("251ms (a|)", {
      a: {
        depth: 0.4972,
        documentHeight: 2500,
        innerHeight: 768,
        innerWidth: 1024,
        scrollTop: 475
      }
    });
  });
});
