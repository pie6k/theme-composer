function combineInterpolations<T>(
  strings: TemplateStringsArray,
  items: T[]
): Array<string | T> {
  const result: Array<string | T> = [];

  const lastIndex = strings.length - 1;
  strings.forEach((string, index) => {
    result.push(string);

    const isLast = index === lastIndex;

    if (!isLast) {
      result.push(items[index]);
    }
  });

  return result;
}

export function createInterpolator<T, R>(
  callback: (items: Array<string | T>) => R
) {
  return function (strings: TemplateStringsArray, ...slots: Array<T | string>) {
    const combinedItems = combineInterpolations(strings, slots);

    return callback(combinedItems);
  };
}

type AllowedCSSInterpolation = string | number;

export const css = createInterpolator((parts: AllowedCSSInterpolation[]) => {
  return parts.join("");
});
