export function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export function deepMergeSingle<T>(target: T, source: DeepPartial<T>): T {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

export function deepMerge<T>(target: T, ...sources: DeepPartial<T>[]): T {
  return sources.reduce((output, nextSource) => {
    return deepMergeSingle(output, nextSource);
  }, target);
}

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
