export class Buffer<T> {
  data: T[] = [];
  length = 0;

  constructor(public maxSize: number = Number.MAX_SAFE_INTEGER) {}

  push(value: T) {
    this.data.unshift(value);

    if (this.data.length > this.maxSize) {
      this.data.length = this.maxSize;
    }

    this.length = this.data.length;
    return this.length;
  }

  pop(): T {
    const value = this.data.shift();
    this.length = this.data.length;
    return value;
  }

  get(index): T {
    return this.data[index];
  }

  clear() {
    this.data.length = 0;
    this.length = 0;
  }
}

// possible future implementation
// buffer.overflow = event => {
//   //if we have 1000 critical events in buffer what happens?
//   if (event.critical) {
//     buffer.push(event);
//   }
// };
