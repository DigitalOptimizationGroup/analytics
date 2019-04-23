// set's the return value from performance.now() - to be used in unit tests
export const setPerformanceNow = (time: number): void => {
  Object.defineProperty(window, "performance", {
    configurable: true,
    get() {
      return { now: () => time };
    }
  });
};
