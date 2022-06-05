import { getIsLeaf } from "./leaf/leaf";
import { typedKeys } from "./leaf/utils";

export function createInputProxy<T extends object>(
  input: T,
  injectedGetter: (...args: any[]) => T
): T {
  const proxy = new Proxy(input, {
    get(target, key, receiver) {
      function getInjected(...args: any[]) {
        const injectedValue = injectedGetter(...args);

        return Reflect.get(injectedValue, key, receiver);
      }

      const actualResult = Reflect.get(target, key, receiver);

      return createInputProxy(actualResult, getInjected);
    },
    apply(target, thisArg, argArray) {
      function getInjected() {
        const injectedFunction = injectedGetter(...argArray);

        return Reflect.apply(injectedFunction as Function, thisArg, argArray);
      }

      if (getIsLeaf(target)) {
        return getInjected();
      }

      const actualResult = Reflect.apply(target as Function, thisArg, argArray);

      return createInputProxy(actualResult, getInjected);
    },
  });

  return proxy;
}
