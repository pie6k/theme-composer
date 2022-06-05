import { createLeaf } from "./leaf/leafComposer";

type StyleOutput = string;

export function styledLeaf(initialGetter?: () => StyleOutput) {
  return createLeaf<StyleOutput>(initialGetter);
}
