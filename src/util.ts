export async function asyncIteratorToArray<T>(iter: AsyncIterable<T>) {
  const result = [];
  for await (const value of iter) {
    result.push(value);
  }
  return result;
}
