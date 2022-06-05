import { createLeaf } from "./leaf/leaf";

type StyleOutput = string;

export function styledLeaf(initialGetter?: () => StyleOutput) {
  return createLeaf<StyleOutput>(initialGetter);
}
