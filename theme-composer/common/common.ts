import { css } from "../css/interpolator";
import { styledLeaf } from "../styleLeaf";
import { autoUnit, MaybeUnit } from "./utils";

export const common = styledLeaf()
  .flag("absolute", () => {
    return css`
      position: absolute;
    `;
  })
  .flag("fixed", () => {
    return css`
      position: fixed;
    `;
  })
  .flag("relative", () => {
    return css`
      position: relative;
    `;
  })
  .flag("sticky", () => {
    return css`
      position: sticky;
    `;
  })
  .prop("inset", (inset: string | number) => {
    return css`
      inset: ${autoUnit(inset)};
    `;
  })
  .prop("padding", (padding: MaybeUnit) => {
    return css`
      padding: ${autoUnit(padding)};
    `;
  })
  .prop("paddingHorizontal", (padding: MaybeUnit) => {
    return css`
      padding-left: ${autoUnit(padding)};
      padding-right: ${autoUnit(padding)};
    `;
  })
  .prop("paddingVertical", (padding: MaybeUnit) => {
    return css`
      padding-top: ${autoUnit(padding)};
      padding-bottom: ${autoUnit(padding)};
    `;
  });
