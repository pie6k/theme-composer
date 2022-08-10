import { getIsLeaf, Leaf } from "./leaf/leaf";

const realValueGetterMap = new WeakMap<object, (...args: any[]) => any>();

export function createInputProxy<T extends object, A extends any[]>(
  templateGetter: () => T,
  realGetter: (...args: A) => T
): T {
  const proxy = new Proxy(templateGetter, {
    get(target, key, receiver) {
      const template = templateGetter();

      if (template === undefined) {
        return undefined;
      }

      const templateProp = Reflect.get(template, key);

      function realPropGetter(...args: A) {
        const real = realGetter(...args);

        console.log({ real, key });

        return Reflect.get(real, key);
      }

      return createInputProxy(() => templateProp, realPropGetter);
    },
    apply(target, thisArg, argArray) {
      /**
       * We're trying to apply on template proxy. It can mean 2 things
       *
       * 1. If we apply on some part that is also function on template - we should follow the template and continue proxying
       * 2. If we apply on some part that is not a function on template - it means we want a result.
       * Exception is leaf - we only apply it when we want a result, it is also applied by styled-components, not by ui code
       */
      const templateMaybeFunction = templateGetter();

      // Applying leaf means we want it's output
      // if (getIsLeaf(templateMaybeFunction)) {
      //   // We know we're applying on leaf, so real value will also be leaf
      //   const realLeaf = realGetter(...(argArray as A)) as Leaf<any, any>;
      //   // Apply it to get the output
      //   return realLeaf();
      // }

      // We apply, but template is not a function - it means real value is requested
      if (typeof templateMaybeFunction !== "function") {
        return realGetter(...(argArray as A));
      }

      // We apply and template is a function as well - it means we keep proxying as we follow template
      const templateResult = Reflect.apply(
        templateMaybeFunction,
        null,
        argArray
      );

      // To get real value we first get real using root input arguments, and then we know real value is a function, so we apply arguments that were passed to this apply
      function realValueGetter(...args: A): T {
        const realFunction = realGetter(...args);

        const realFunctionReturnValue = Reflect.apply(
          realFunction as Function,
          null,
          argArray
        );

        return realFunctionReturnValue;
      }

      return createInputProxy(() => templateResult, realValueGetter);
    },
  });

  realValueGetterMap.set(proxy, realGetter);

  return proxy;
}
