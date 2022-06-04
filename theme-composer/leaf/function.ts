import { typedKeys } from "./utils";

export type FunctionWithProps<A extends any[], R, Props> = ((...args: A) => R) &
  Props;

function copyPropsWithoutReading(target: any, source: any) {
  Object.keys(source).forEach((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);

    Object.defineProperty(target, key, descriptor);
  });
}

export function createFunctionWithProps<A extends any[], R, Props>(
  callback: (...args: A) => R,
  props: Props
): FunctionWithProps<A, R, Props> {
  function wrappedFunction(...args: A): R {
    return callback(...args);
  }

  copyPropsWithoutReading(wrappedFunction, props);

  return wrappedFunction as FunctionWithProps<A, R, Props>;
}
