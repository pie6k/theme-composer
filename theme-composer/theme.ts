import { createInputProxy, getRealValue } from "./inputProxy";
import { Leaf } from "./leaf/leaf";
import { deepMerge, DeepPartial } from "./utils/deepMerge";

interface ThemeProps<T> {
  theme: T;
}

type Theme<T> = T & {
  raw: T;
};

export function createTheme<T extends object>(theme: T) {
  const proxiedTheme = createInputProxy(
    () => theme,
    (props: ThemeProps<T>) => {
      return props.theme;
    }
  );

  function getValue<O>(leaf: () => O, props: ThemeProps<T>) {
    console.log("will get");
    const proxyTrap = leaf();
    console.log("has trap", !!proxyTrap);

    console.log("with trap", { props });

    // return dgetRealValue(proxyTrap, props)

    return proxyTrap(...([props] as any as [])) as O;
  }

  Reflect.set(theme, "raw", theme);

  return [proxiedTheme as Theme<T>, getValue] as const;
}

export type ThemeOverwrite<T extends object> = DeepPartial<T>;

export function createThemeOverwrite<T extends object>(
  theme: T,
  overwrite: ThemeOverwrite<T>
): ThemeOverwrite<T> {
  return overwrite;
}

export function applyThemeOverwrites<T extends object>(
  theme: Theme<T>,
  ...overrides: ThemeOverwrite<T>[]
) {
  return deepMerge(theme.raw, ...overrides);
}
