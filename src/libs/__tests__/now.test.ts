import { now } from "../now";
import { setPerformanceNow } from "../../__helpers__/setPerformanceNow";

it("now() returns a number", () => {
  expect(now()).not.toBeNaN();
});

it("now() returns value from performance.now()", () => {
  setPerformanceNow(1299);
  expect(now()).toBe(1299);
});
