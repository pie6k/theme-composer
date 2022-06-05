import { leafBuildInKeys } from "./builtIn";
import { createLeafInstance, Leaf } from "./leaf";
import { typedKeys } from "./utils";

type Maybe<T> = T | undefined | void;

export type Identity<T> = T extends object
  ? {
      [P in keyof T]: Identity<T[P]>;
    }
  : T;

type AddComposerProp<T, Output, K extends string, V> = AddComposerData<
  T,
  Output,
  { [key in K]: V }
>;

type AddComposerData<T, Output, N> = LeafComposer<Identity<T & N>, Output>;

type ComposerPropOutputBuilder<T, Output, K extends string, Value> = (
  value: Value,
  current: T
) => Maybe<Output>;

type DataOutputBuilder<Data, Output> = (values: Data) => Output;

interface LeafComposer<Data, Output> {
  prop<Key extends string, Value>(
    key: Key,
    builder?: ComposerPropOutputBuilder<Data, Output, Key, Value>
  ): AddComposerProp<Data, Output, Key, Value | undefined>;
  addDefaults<NewData>(data: NewData): AddComposerData<Data, Output, NewData>;
  requiredProp<Key extends string, Value>(
    key: Key,
    builder?: ComposerPropOutputBuilder<Data, Output, Key, Value> | null,
    defaultValue?: Value
  ): AddComposerProp<Data, Output, Key, Value>;
  flag<Key extends string>(
    key: Key,
    getter?: (current: Data) => Maybe<Output>
  ): AddComposerProp<Data, Output, Key, true>;
  done(getter?: (values: Data) => Maybe<Output>): Leaf<Data, Output>;
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
    addDefaults<NewData>(newData: NewData) {
      const newPropsMap: PropsMap<Data, Output> = {
        ...props,
      };

      typedKeys(newData).forEach((newKey) => {
        const propInfo: LeafPropInfo<Data, Output> = {
          type: "prop",
          isRequired: true,
          defaultValue: newData[newKey] as unknown as Data[keyof Data],
        };
        newPropsMap[newKey as unknown as keyof Data] = propInfo;
      });

      return createLeafComposer(newPropsMap, initialGetter) as LeafComposer<
        any,
        any
      >;
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
