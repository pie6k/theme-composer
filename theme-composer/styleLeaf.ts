import { createLeaf } from "./leaf/leaf";
import { css, FlattenSimpleInterpolation } from "styled-components";

type StyleOutput = FlattenSimpleInterpolation;

export function styledLeaf(initialGetter?: () => StyleOutput) {
  return createLeaf<StyleOutput>(initialGetter);
}
