import { createInputProxy } from "./inputProxy";
import { deepMerge, DeepPartial } from "./utils/deepMerge";

interface ThemeProps<T> {
  theme: T;
}

type Theme<T> = T & {
  raw: T;
};

export function createTheme<T extends object>(theme: T): Theme<T> {
  const proxiedTheme = createInputProxy(theme, (props: ThemeProps<T>) => {
    return props.theme;
  });

  Reflect.set(theme, "raw", theme);

  return proxiedTheme as Theme<T>;
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
