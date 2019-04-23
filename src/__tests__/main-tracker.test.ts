import { Server } from "mock-socket";
import { initTracker } from "../main-tracker";
import { setPerformanceNow } from "../__helpers__/setPerformanceNow";

const WS_FQDN = "ws://localhost:8080";

const rid = "rid_123",
  vid = "vid_123",
  projectId = "test",
  startTimestamp = 34234,
  apiKey = "apid_abc_123";

// this URL needs to match exactly what is set up with the mock-socket
const SOCKET_URL = `${WS_FQDN}?apiKey=${apiKey}&rid=${rid}&vid=${vid}&startTimestamp=${startTimestamp}&projectId=${projectId}`;

//need to figure out how to get IntersectionObserver working in jest test
it("Connects to websocket and sends events", done => {
  const mockServer = new Server(SOCKET_URL);

  const events = [];

  setPerformanceNow(1200);

  mockServer.on("connection", socket => {
    socket.on("message", data => {
      events.push(JSON.parse(data));
      if (events.length === 9) {
        expect(events).toEqual([
          {
            type: "CAUGHT_ERROR",
            metadata: [{ key: "message", value: "auth error 123" }],
            elapsedTime: 1200
          },
          {
            type: "OUTCOME",
            outcome: "addToCart",
            metadata: [{ key: "sku", value: "great-product-one" }],
            elapsedTime: 1200
          },
          {
            type: "PAGE_VIEW",
            elapsedTime: 1200,
            pathname: "/about-us",
            entryDepth: null,
            scrollTopOnEntry: 0,
            viewportWidth: 1024,
            viewportHeight: 768,
            documentHeight: 0
          },
          {
            type: "TIME_ON_SITE",
            elapsedInterval: 1,
            visibility: "visible",
            elapsedTime: 1200
          },
          {
            type: "TIME_ON_PAGE",
            elapsedInterval: 1,
            visibility: "visible",
            pathname: "/about-us",
            elapsedTime: 1200
          },
          {
            type: "TIME_ON_SITE",
            elapsedInterval: 1,
            visibility: "visible",
            elapsedTime: 1200
          },
          {
            type: "TIME_ON_PAGE",
            elapsedInterval: 1,
            visibility: "visible",
            pathname: "/about-us",
            elapsedTime: 1200
          },
          {
            type: "TIME_ON_SITE",
            elapsedInterval: 1,
            visibility: "visible",
            elapsedTime: 1200
          },
          {
            type: "TIME_ON_PAGE",
            elapsedInterval: 1,
            visibility: "visible",
            pathname: "/about-us",
            elapsedTime: 1200
          }
        ]);
        done();
      }
    });
  });

  const {
    pathChange,
    outcome,
    caughtError,
    initIntersectionObserver
  } = initTracker(
    {
      rid,
      vid,
      projectId,
      startTimestamp,
      apiKey
    },
    WS_FQDN
  );

  pathChange("/about-us");
  outcome("addToCart", [{ key: "sku", value: "great-product-one" }]);
  caughtError([{ key: "message", value: "auth error 123" }]);
});
