import { getIsLeaf } from "./leaf/leaf";

export function createInputProxy<T extends object, A extends any[]>(
  input: T,
  injectedGetter: (...args: A) => T
): T {
  const proxy = new Proxy(input, {
    get(target, key, receiver) {
      console.log("prox get", key);
      function getInjected(...args: any[]) {
        console.log("p get injected", { args, key, target });
        const injectedValue = injectedGetter(...(args as A));

        // console.log({ injectedValue, key, receiver });

        return Reflect.get(injectedValue, key, receiver);
      }

      const actualResult = Reflect.get(target, key, receiver);

      return createInputProxy(actualResult, getInjected);
    },
    apply(target, thisArg, argArray) {
      console.log("p apply", { target, argArray });
      function getInjected(...args: A) {
        console.log("getting injected", { argArray });
        const injectedFunction = injectedGetter(...(args as A));

        return Reflect.apply(injectedFunction as Function, thisArg, argArray);
      }

      if (getIsLeaf(target)) {
        console.log("is leaf", target.$data);
        return getInjected(...argArray);
      }

      const actualResult = Reflect.apply(target as Function, thisArg, argArray);

      console.log("apply not leaf", { actualResult });

      return createInputProxy(actualResult, getInjected);
    },
  });

  return proxy;
}
