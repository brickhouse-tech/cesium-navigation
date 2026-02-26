/**
 * Simple reactive state management to replace Knockout.js
 */

export type Subscriber<T> = (value: T) => void;

export class Observable<T> {
  private value: T;
  private subscribers: Set<Subscriber<T>> = new Set();

  constructor(initialValue: T) {
    this.value = initialValue;
  }

  get(): T {
    return this.value;
  }

  set(newValue: T): void {
    if (this.value !== newValue) {
      this.value = newValue;
      this.notify();
    }
  }

  subscribe(subscriber: Subscriber<T>): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  private notify(): void {
    this.subscribers.forEach(sub => sub(this.value));
  }
}

export class Computed<T> {
  private value: T;
  private subscribers: Set<Subscriber<T>> = new Set();
  private compute: () => T;

  constructor(compute: () => T) {
    this.compute = compute;
    this.value = compute();
  }

  get(): T {
    return this.value;
  }

  update(): void {
    const newValue = this.compute();
    if (this.value !== newValue) {
      this.value = newValue;
      this.notify();
    }
  }

  subscribe(subscriber: Subscriber<T>): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  private notify(): void {
    this.subscribers.forEach(sub => sub(this.value));
  }
}

/**
 * Create an observable value
 */
export function observable<T>(initialValue: T): Observable<T> {
  return new Observable(initialValue);
}

/**
 * Create a computed observable
 */
export function computed<T>(compute: () => T): Computed<T> {
  return new Computed(compute);
}
