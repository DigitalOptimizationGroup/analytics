# Digital Optimization Group - Javascript Analytics

This library is made to work with Digital Optimization Group's Headless A/B testing CMS. It provides a range of event tracking automatically, plus it provides a public api to allow custom event tracking.

At `15kb` gzipped it's lighter than Google Analytics.

If you are using `React` or `Preact` you may prefer to use `@digitaloptgroup/react-analytics` or `@digitaloptgroup/preact-analytics`, which provide convenient `React` and `Preact` wrappers over this library.

### What's tracked by this library?

- a/b test variations actually appearing in a user's viewport (not just assignment)
- time a variation is in a user's viewport
- time on site and time on page
- visibility of the page (is tab visible?)
- mouse distance
- total scrolling distance by page
- scroll depth per page
- errors
- arbitrary `outcomes` set up by the user of this library
- page views
- orientation changes (mobile devices)
- mousedown activity on a variation

All events are placed on a timeline so that outcomes can be properly attributed to variations actually appearing in the viewport. For example, we shouldn't attribute an order that occured before a variation was in the viewport to that variation when running an a/b test.

### Usage

npm

```js
npm install --save @digitaloptgroup/js-analytics
```

yarn

```js
yarn add @digitaloptgroup/js-analytics
```

#### Initialze

```js
import { initTracker } from "@digitaloptgroup/js-analytics";

const config = {
  apiKey: "your-api-key",
  projectId: "your-project-id",

  // optional advanced configuration
  // see advanced further down this README
  vid: "visitor_id",
  rid: "request_id",
  startTimestamp: "proxy_startTimestamp"
};

const {
  pathChange,
  outcome,
  caughtError,
  getIntersectionObserver
} = initTracker(config);
```

### Track Pageviews

```js
const pathname = "/about-us";
pathChange(pathname);
```

### Track Outcomes

Tracking events with `outcome` is intended as a means to track any custom user actions that you would like to associate with your a/b test variations.

`outcome` takes two arguments `outcomeName` and `metadata`. The name must be a string. The metadata must be an array containing an arbitrary number of objects with the type signature `{ key: string, value: string }`.

```js
const outcomeName = "addToCart";
const metadata = [
  { key: "sku", value: "product_123" },
  { key: "price", value: "125.99" }
];
outcome(outcomeName, metadata);
```

### Caught Errors

If you would like to report a caught error you may do so with `caughtError`.

```js
const metadata = [
  { key: "type", value: "auth_failed" },
  { key: "url", value: "/login" }
];
caughtError(metadata);
```

### Observe / Unobserve Variation

`initIntersectionObserver` provides viewport tracking for a/b test variations. It is intended to be used with Digital Optimization Group's Headless CMS. To properly track a dom element you must add `dataset` attributes to the dom element.

```html
<div
    id="mydiv"
    data-releaseid="release_id_123"
    data-featureid="feature_id_123"
    data-variationid="variation_id_abc"
    data-exposureid="exposure_id_453"
    data-position="1"
>
    {title}
</div>
```

You must initialize the `IntersectionObserver` by calling `initIntersectionObserver()`. This should only happen once.

```js
const { observe, unobserve } = getIntersectionObserver();
```

You can then track multiple dom elements using `observe` as follows:

```js
const domElement = document.getElementById("mydiv");
observe(domElement);

const domElement2 = document.getElementById("mydiv2");
observe(domElement2);
```

The variation can later be unobserved by passing the dom element into `unobserve` as follows:

```js
const domElement = document.getElementById("mydiv");
unobserve(domElement);
```

### Automatically Tracked Events

In addition to the events listed above, this library automatically tracks the following events:

##### Euclidian Mouse Distance

The library will sample mouse position every 250ms and calculate the euclidean distance from prior `x` and `y` coordinates. It will report the total every 3 seconds.

##### Page Scrolling

The `depth` and `distance` of scrolling activity will be reported in 3 second windows.

##### Orientation Change

Orientation change will be reported for mobile devices.

##### Rapid Clicking (or Rage Clicking)

If multiple clicks are recorded within a very small pixel range the number of clicks and the underlying `innerHTML` will be reported.

##### Time on Page

Time on page events will be emitted in a decreasing interval.

##### Time on Site

Time on site events will be emitted in a decreasing interval.

##### Mousedown on variation

Mousedown events occuring on a tracked variation will be reported.
