import { createFunctionWithProps, FunctionWithProps } from "./function";
import { PickByValue } from "./types";
import { isNotPrimitive, isPrimitive, typedKeys } from "./utils";

type LeafBuiltInMethods<T> = {
  $data: T;
  $isLeaf: true;
};

type LeafBuildInKey = keyof LeafBuiltInMethods<any>;

const leafBuildInKeys: Array<LeafBuildInKey> = ["$data", "$isLeaf"];

type LeafPropMethods<T, Output> = {
  [key in keyof T]: T[key] extends true
    ? Leaf<T, Output>
    : (arg: T[key]) => Leaf<T, Output>;
};

type LeafMethods<T, Output> = LeafPropMethods<T, Output> &
  LeafBuiltInMethods<T>;

type Leaf<T, Output> = FunctionWithProps<[], Output[], LeafMethods<T, Output>>;

type Maybe<T> = T | undefined | void;

export type Identity<T> = T extends object
  ? {
      [P in keyof T]: Identity<T[P]>;
    }
  : T;

type AddComposerProp<T, Output, K extends string, V> = LeafComposer<
  Identity<T & { [key in K]: V }>,
  Output
>;

type ComposerPropOutputBuilder<T, Output, K extends string, Value> = (
  value: Value,
  current: T
) => Maybe<Output>;

interface LeafComposer<Data, Output> {
  prop<Key extends string, Value>(
    key: Key,
    builder?: ComposerPropOutputBuilder<Data, Output, Key, Value>
  ): AddComposerProp<Data, Output, Key, Value | undefined>;
  requiredProp<Key extends string, Value>(
    key: Key,
    builder?: ComposerPropOutputBuilder<Data, Output, Key, Value> | null,
    defaultValue?: Value
  ): AddComposerProp<Data, Output, Key, Value>;
  flag<Key extends string>(
    key: Key,
    getter?: (current: Data) => Maybe<Output>
  ): AddComposerProp<Data, Output, Key, true>;
  done(getter?: (values: Data) => Output): Leaf<Data, Output>;
}

type Getter<T, Output> = (data: T) => Output;

type LeafPropInfo<T, Output> =
  | { type: "flag"; getter?: Getter<T, Maybe<Output>> }
  | {
      getter?: Getter<T, Maybe<Output>>;
      type: "prop";
      isRequired?: true;
      defaultValue?: T[keyof T];
    };

type PropsMap<T, Output> = Record<keyof T, LeafPropInfo<T, Output>>;

interface LeafPropValue<T, K extends keyof T> {
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
  propValues: LeafPropValue<T, keyof T>[],
  initialGetter?: () => Output,
  finalGetter?: (data: T) => Output
): Leaf<T, Output> {
  type Key = keyof T;
  type Value = T[keyof T];

  const requiredUserKeys = Object.keys(props).filter((key) => {
    const propInfo = props[key as Key];

    return (
      propInfo.type === "prop" &&
      propInfo.isRequired === true &&
      propInfo.defaultValue === undefined
    );
  }) as Key[];

  function getDefaultData(): T {
    const data: T = {} as T;

    const requiredUserKeys = typedKeys(props).filter((key) => {
      const propInfo = props[key as Key];

      if (propInfo.type === "prop" && propInfo.defaultValue !== undefined) {
        data[key] = propInfo.defaultValue;
      }
    }) as Key[];

    return data;
  }

  const defaultData = getDefaultData();

  function getMissingRequiredKeys() {
    const presentKeys = propValues.map((value) => value.name);
    const missingRequiredKeys = requiredUserKeys.filter((requiredKey) => {
      return !presentKeys.includes(requiredKey);
    });

    return missingRequiredKeys;
  }

  function assertRequiredFieldsPresent(
    errorGetter: (missingFields: Key[], missingFieldsList: string) => Error
  ) {
    const missingRequiredKeys = getMissingRequiredKeys();

    if (missingRequiredKeys.length === 0) return;

    throw errorGetter(
      missingRequiredKeys,
      missingRequiredKeys.map((key) => `"${key}"`).join(", ")
    );
  }

  function getData() {
    const data = { ...defaultData };

    for (const propValue of propValues) {
      data[propValue.name] = propValue.value;
    }

    return data;
  }

  function getOutput(): Output[] {
    assertRequiredFieldsPresent((_, list) => {
      return new Error(
        `Cannot get leaf output with missing required fields - missing fields ${list}`
      );
    });

    const data: T = { ...defaultData };

    const output: Output[] = [];

    if (initialGetter) {
      output.push(initialGetter());
    }

    for (const propValue of propValues) {
      const correspondingProp = props[propValue.name];

      data[propValue.name] = propValue.value;

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

  function addPropValue(key: Key, value: Value) {
    return createLeafInstance(
      props,
      [...propValues, { name: key, value }],
      initialGetter,
      finalGetter
    );
  }

  const leaf = new Proxy(getOutput, {
    get(target, key, receiver) {
      if (key === ("$isLeaf" as LeafBuildInKey)) {
        return true;
      }

      if (key === ("$data" as LeafBuildInKey)) {
        assertRequiredFieldsPresent((_, list) => {
          return new Error(
            `Cannot get data using $data from leaf before all required props are filled - missing required props - ${list}`
          );
        });
        return getData();
      }
      const prop = props[key as keyof T];

      if (!prop) {
        return undefined;
      }

      if (prop.type === "flag") {
        return addPropValue(key as Key, true as unknown as Value);
      }

      if (prop.type === "prop") {
        if (!prop.isRequired) {
          assertRequiredFieldsPresent((_, list) => {
            return new Error(
              `Cannot add optional prop "${
                key as string
              }" before all required props are filled - missing required props - ${list}`
            );
          });
        }

        return function valueAdder(value: Value) {
          return addPropValue(key as Key, value);
        };
      }

      return Reflect.get(target, key, receiver);
    },
    ownKeys() {
      return Object.keys(props);
    },
    has(target, key) {
      return Reflect.has(props, key);
    },
  });

  isLeafSet.add(leaf as Leaf<T, Output>);

  return leaf as Leaf<T, Output>;
}

function createLeafComposer<Data, Output>(
  props: PropsMap<Data, Output>,
  initialGetter?: () => Output
): LeafComposer<Data, Output> {
  function assertCanAddProp(key: string) {
    if (key in props) {
      throw new Error(
        `Trying to add prop "${key}" to leaf composer, but this field is already defined.`
      );
    }

    if (leafBuildInKeys.includes(key as any)) {
      throw new Error(
        `Cannot add prop "${key}" to leaf composer. This field is reserved as built in prop`
      );
    }
  }

  function addProp<Key extends string, Value>(
    key: Key,
    builder?: ComposerPropOutputBuilder<Data, Output, Key, Value> | null,
    isRequired?: true,
    defaultValue?: Value
  ): AddComposerProp<Data, Output, Key, Value> {
    assertCanAddProp(key);

    if (!builder) {
      return createLeafComposer(
        { ...props, [key]: { type: "prop", isRequired, defaultValue } },
        initialGetter
      ) as LeafComposer<any, any>;
    }

    function wrappedGetter(data: Data): Maybe<Output> {
      const thisKeyData = data[key as unknown as keyof Data];

      return builder!(thisKeyData as any, data);
    }

    const propInfo: LeafPropInfo<Data, Output> = {
      type: "prop",
      getter: wrappedGetter,
      isRequired,
      defaultValue: defaultValue as unknown as Data[keyof Data],
    };

    const newPropsMap: PropsMap<Data, Output> = {
      ...props,
      [key as unknown as keyof Data]: propInfo,
    };

    return createLeafComposer(newPropsMap, initialGetter) as LeafComposer<
      any,
      any
    >;
  }

  return {
    prop(key, getter) {
      return addProp(key, getter) as LeafComposer<any, any>;
    },
    requiredProp(key, getter, defaultValue) {
      return addProp(key, getter, true, defaultValue) as LeafComposer<any, any>;
    },
    flag(key, getter) {
      assertCanAddProp(key);

      const propInfo: LeafPropInfo<Data, Output> = {
        type: "flag",
        getter: getter,
      };

      const newPropsMap: PropsMap<Data, Output> = {
        ...props,
        [key as unknown as keyof Data]: propInfo,
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
