import { LeafBuildInKey, LeafBuiltInMethods } from "./builtIn";
import { FunctionWithProps } from "./function";
import { typedKeys } from "./utils";

type LeafPropMethods<T, Output> = {
  [key in keyof T]: T[key] extends true
    ? Leaf<T, Output>
    : (arg: T[key]) => Leaf<T, Output>;
};

type LeafMethods<T, Output> = LeafPropMethods<T, Output> &
  LeafBuiltInMethods<T>;

export type Leaf<T, Output> = FunctionWithProps<
  [],
  Output[],
  LeafMethods<T, Output>
>;

type Maybe<T> = T | undefined | void;

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

export function getIsLeaf(input: unknown): input is Leaf<any, any> {
  if (!input) return false;

  return (input as Leaf<any, any>).$isLeaf === true;
}

export function createLeafInstance<T, Output>(
  props: PropsMap<T, Output>,
  propValues: LeafPropValue<T, keyof T>[],
  initialGetter?: () => Output,
  finalGetter?: (data: T) => Maybe<Output>
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

    typedKeys(props).forEach((key) => {
      const propInfo = props[key as Key];

      if (propInfo.type === "prop" && propInfo.defaultValue !== undefined) {
        data[key] = propInfo.defaultValue;
      }
    });

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

  function getOutputAndData() {
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
      const finalOutput = finalGetter(data);

      if (finalOutput !== undefined) {
        output.push(finalOutput);
      }
    }

    return [output, data] as const;
  }

  function getOutput(): Output[] {
    assertRequiredFieldsPresent((_, list) => {
      return new Error(
        `Cannot get leaf output with missing required fields - missing fields ${list}`
      );
    });

    const [output] = getOutputAndData();

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

        const [, data] = getOutputAndData();
        return data;
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

  return leaf as Leaf<T, Output>;
}
