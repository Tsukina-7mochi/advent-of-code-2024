export async function asyncIteratorToArray<T>(
  iter: AsyncIterable<T>,
): Promise<T[]> {
  const result = [];
  for await (const value of iter) {
    result.push(value);
  }
  return result;
}

export async function reduceAsyncIterator<T, U>(
  iter: AsyncIterable<T>,
  reducer: (acc: U, cur: T) => U,
  initialValue: U,
): Promise<U> {
  let result = initialValue;
  for await (const value of iter) {
    result = reducer(result, value);
  }
  return result;
}

export type Vec2<T = number> = { x: T; y: T };
