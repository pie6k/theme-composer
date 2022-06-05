export function typedKeys<T>(input: T) {
  return Object.keys(input) as Array<keyof T>;
}

export type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;

export function isPrimitive(val: unknown): val is Primitive {
  if (val === null) {
    return true;
  }

  if (typeof val == "object" || typeof val == "function") {
    return false;
  }

  return true;
}

export function isNotPrimitive(input: unknown): input is object {
  if (typeof input === "object" || typeof input === "function") {
    return true;
  }

  return input !== null;
}
