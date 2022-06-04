export function typedKeys<T>(input: T) {
  return Object.keys(input) as Array<keyof T>;
}
