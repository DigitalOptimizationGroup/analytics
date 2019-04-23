type ViewPortDimentions = {
  documentHeight: number;
  scrollTop: number;
  innerWidth: number;
  innerHeight: number;
  depth: number;
};

export const getViewportDimensions = (): ViewPortDimentions => {
  const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName("body")[0];

  const body = document.body,
    html = document.documentElement;

  const documentHeight = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );

  const supportPageOffset = window.pageXOffset !== undefined;
  const isCSS1Compat = (document.compatMode || "") === "CSS1Compat";

  const scrollX = supportPageOffset
    ? window.pageXOffset
    : isCSS1Compat
      ? document.documentElement.scrollLeft
      : document.body.scrollLeft;

  const scrollTop = supportPageOffset
    ? window.pageYOffset
    : isCSS1Compat
      ? document.documentElement.scrollTop
      : document.body.scrollTop;

  const innerWidth = w.innerWidth || e.clientWidth || g.clientWidth;
  const innerHeight = w.innerHeight || e.clientHeight || g.clientHeight;

  return {
    documentHeight,
    scrollTop,
    innerWidth,
    innerHeight,
    depth: (scrollTop + innerHeight) / documentHeight
  };
};
