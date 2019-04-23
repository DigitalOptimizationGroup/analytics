import { Buffer } from "../buffer";

it("Drops the oldest items in the buffer on overflow", () => {
  const buffer = new Buffer(3);
  buffer.push("a");
  buffer.push("b");
  buffer.push("c");
  buffer.push("d");

  expect(buffer.data).toEqual(["d", "c", "b"]);
});

it("pop() pulls the newest item off the buffer", () => {
  const buffer = new Buffer(3);
  buffer.push("a");
  buffer.push("b");
  buffer.push("c");
  buffer.push("d");

  expect(buffer.pop()).toEqual("d");
  expect(buffer.data).toEqual(["c", "b"]);
});

it("get(0) gets the newest item from the buffer without removing it", () => {
  const buffer = new Buffer(3);
  buffer.push("a");
  buffer.push("b");
  buffer.push("c");
  buffer.push("d");

  expect(buffer.get(0)).toEqual("d");
  expect(buffer.data).toEqual(["d", "c", "b"]);
});

it("clear() clears the entire buffer", () => {
  const buffer = new Buffer(3);
  buffer.push("a");
  buffer.push("b");
  buffer.push("c");
  buffer.push("d");

  buffer.clear();
  expect(buffer.data).toEqual([]);
});
