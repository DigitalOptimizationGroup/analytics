import { map } from "rxjs/operators";
import { getViewportDimensions } from "../libs/getViewportDimensions";
import { pathChange$ } from "./pathChange";

export type PageView = {
  type: "PAGE_VIEW";
  elapsedTime: number;
  pathname: string;
  entryDepth: number;
  scrollTopOnEntry: number;
  viewportWidth: number;
  viewportHeight: number;
  documentHeight: number;
};

export const pageView$ = pathChange$.pipe(
  map(
    ({ pathname, elapsedTime }): PageView => {
      const {
        documentHeight,
        scrollTop,
        innerWidth,
        innerHeight,
        depth
      } = getViewportDimensions();
      return {
        type: "PAGE_VIEW",
        elapsedTime,
        pathname,
        entryDepth: depth,
        scrollTopOnEntry: scrollTop,
        viewportWidth: innerWidth,
        viewportHeight: innerHeight,
        documentHeight
      };
    }
  )
);
