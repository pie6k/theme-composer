import { createFunctionWithProps, FunctionWithProps } from "./function";
import { PickByValue } from "./types";
import { isNotPrimitive, isPrimitive, typedKeys } from "./utils";

type LeafMethods<T, Output> = {
  [key in keyof T]: T[key] extends true
    ? Leaf<T, Output>
    : (arg: T[key]) => Leaf<T, Output>;
};

type Leaf<T, Output> = FunctionWithProps<[], Output[], LeafMethods<T, Output>>;

type Maybe<T> = T | undefined | void;

export type Identity<T> = T extends object
  ? {
      [P in keyof T]: Identity<T[P]>;
    }
  : T;

interface LeafComposer<T, Output> {
  prop<K extends string, A>(
    key: K,
    getter?: (value: A, current: Partial<T>) => Maybe<Output>
  ): LeafComposer<Identity<T & { [key in K]: A }>, Output>;
  requiredProp<K extends string, A>(
    key: K,
    getter?: (value: A, current: Partial<T>) => Maybe<Output>
  ): LeafComposer<Identity<T & { [key in K]: A }>, Output>;
  flag<K extends string>(
    key: K,
    getter?: (current: Partial<T>) => Maybe<Output>
  ): LeafComposer<Identity<T & { [key in K]: true }>, Output>;
  done(getter?: (values: Partial<T>) => Output): Leaf<T, Output>;
}

type Getter<T, Output> = (data: T) => Output;

type LeafPropInfo<T, Output> =
  | { type: "flag"; getter?: Getter<Partial<T>, Maybe<Output>> }
  | {
      getter?: Getter<Partial<T>, Maybe<Output>>;
      type: "prop";
      isRequired?: true;
    };

type PropsMap<T, Output> = Record<keyof T, LeafPropInfo<T, Output>>;

interface LeafInstancePropFlag<T, K extends keyof T, Output> {
  name: K;
  value: T[K];
}

const isLeafSet = new WeakSet<Leaf<any, any>>();

export function getIsLeaf(input: unknown): input is Leaf<any, any> {
  if (isPrimitive(input)) return false;

  return isLeafSet.has(input as Leaf<any, any>);
}

function createLeafInstance<T, Output>(
  props: PropsMap<T, Output>,
  flags: LeafInstancePropFlag<T, keyof T, Output>[],
  initialGetter?: () => Output,
  finalGetter?: (data: Partial<T>) => Output
): Leaf<T, Output> {
  const methods: LeafMethods<T, Output> = {} as LeafMethods<T, Output>;

  typedKeys(props).forEach((key) => {
    const propInfo = props[key];
    if (propInfo.type === "flag") {
      Reflect.defineProperty(methods, key, {
        enumerable: true,
        configurable: false,
        get() {
          return createLeafInstance(
            props,
            [...flags, { name: key, value: true as unknown as T[keyof T] }],
            initialGetter,
            finalGetter
          );
        },
      });
      return;
    }

    if (propInfo.type === "prop") {
      Reflect.defineProperty(methods, key, {
        enumerable: true,
        writable: false,
        configurable: false,
        value: (propValue: T[keyof T]) => {
          return createLeafInstance(
            props,
            [...flags, { name: key, value: propValue }],
            initialGetter,
            finalGetter
          );
        },
      });
    }
  });

  function getOutput(): Output[] {
    const data: Partial<T> = {};

    const output: Output[] = [];

    if (initialGetter) {
      output.push(initialGetter());
    }

    for (const flag of flags) {
      const correspondingProp = props[flag.name];

      data[flag.name] = flag.value;

      if (correspondingProp.getter) {
        const nextOutput = correspondingProp.getter(data);

        if (nextOutput !== undefined) {
          output.push(nextOutput as Output);
        }
      }
    }

    if (finalGetter) {
      output.push(finalGetter(data));
    }

    return output;
  }

  const leaf: Leaf<T, Output> = createFunctionWithProps(getOutput, methods);

  isLeafSet.add(leaf);

  return leaf;
}

function createLeafComposer<T, Output>(
  props: PropsMap<T, Output>,
  initialGetter?: () => Output
): LeafComposer<T, Output> {
  return {
    prop(key, getter) {
      if (key in props) {
        throw new Error("Already there");
      }

      if (!getter) {
        return createLeafComposer(
          { ...props, [key]: { type: "prop" } },
          initialGetter
        );
      }

      function wrappedGetter(data: Partial<T>): Maybe<Output> {
        const thisKeyData = data[key as unknown as keyof T];

        return getter(thisKeyData as any, data);
      }

      const propInfo: LeafPropInfo<T, Output> = {
        type: "prop",
        getter: wrappedGetter,
      };

      const newPropsMap: PropsMap<T, Output> = {
        ...props,
        [key as unknown as keyof T]: propInfo,
      };

      return createLeafComposer(newPropsMap, initialGetter) as LeafComposer<
        any,
        any
      >;
    },
    requiredProp(key, getter) {
      if (key in props) {
        throw new Error("Already there");
      }

      if (!getter) {
        return createLeafComposer(
          { ...props, [key]: { type: "prop", isRequired: true } },
          initialGetter
        );
      }

      function wrappedGetter(data: Partial<T>): Maybe<Output> {
        const thisKeyData = data[key as unknown as keyof T];

        return getter(thisKeyData as any, data);
      }

      const propInfo: LeafPropInfo<T, Output> = {
        type: "prop",
        getter: wrappedGetter,
        isRequired: true,
      };

      const newPropsMap: PropsMap<T, Output> = {
        ...props,
        [key as unknown as keyof T]: propInfo,
      };

      return createLeafComposer(newPropsMap, initialGetter) as LeafComposer<
        any,
        any
      >;
    },
    flag(key, getter) {
      if (key in props) {
        throw new Error("Already there");
      }

      const propInfo: LeafPropInfo<T, Output> = {
        type: "flag",
        getter: getter,
      };

      const newPropsMap: PropsMap<T, Output> = {
        ...props,
        [key as unknown as keyof T]: propInfo,
      };

      return createLeafComposer(newPropsMap, initialGetter) as LeafComposer<
        any,
        any
      >;
    },
    done(finalGetter) {
      return createLeafInstance(props, [], initialGetter, finalGetter);
    },
  };
}

export function createLeaf<Output>(
  initialStylesGetter?: () => Output
): LeafComposer<{}, Output> {
  return createLeafComposer({}, initialStylesGetter);
}
