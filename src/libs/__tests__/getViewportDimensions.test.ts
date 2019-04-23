import { getViewportDimensions } from "../getViewportDimensions";

it("Get's viewport dimentions", () => {
  expect(getViewportDimensions()).toEqual({
    depth: Infinity,
    documentHeight: 0,
    innerHeight: 768,
    innerWidth: 1024,
    scrollTop: 0
  });
});
