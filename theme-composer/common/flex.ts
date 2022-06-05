import { css } from "../css/interpolator";
import { styledLeaf } from "../styleLeaf";

export const flex = styledLeaf(() => {
  return css`
    display: flex;
  `;
})
  .prop("gap", (px: number | string) => {
    if (typeof px === "number") {
      return css`
        gap: ${px}px;
      `;
    }

    return css`
      gap: ${px};
    `;
  })
  .flag("column", () => {
    return css`
      flex-direction: column;
    `;
  })
  .flag("row", () => {
    return css`
      flex-direction: row;
    `;
  })
  .prop("justify", (how: Justify) => {
    return css`
      justify-content: ${how};
    `;
  })
  .prop("align", (how: Align) => {
    return css`
      align-items: ${how};
    `;
  })
  .flag("reverse", ({ column, row }) => {
    if (column) {
      return css`
        flex-direction: column-reverse;
      `;
    }

    return css`
      flex-direction: row-reverse;
    `;
  })
  .flag("wrap", () => {
    return css`
      flex-wrap: wrap;
    `;
  })
  .done();

export const flexItem = styledLeaf()
  .prop("order", (order: number) => {
    return css`
      order: ${order};
    `;
  })
  .prop("grow", (grow: number) => {
    return css`
      flex-grow: ${grow};
    `;
  })
  .prop("shrink", (shrink: number) => {
    return css`
      flex-shrink: ${shrink};
    `;
  })
  .prop("basis", (basis: number | string) => {
    return css`
      flex-basis: ${basis};
    `;
  })
  .prop("alignSelf", (how: Align) => {
    return css`
      align-self: ${how};
    `;
  });

type Justify =
  | "center"
  | "start"
  | "end"
  | "flex-start"
  | "flex-end"
  | "left"
  | "right"
  | "space-between"
  | "space-around"
  | "space-evenly"
  | "stretch"
  | "safe center"
  | "unsafe center"
  | "inherit"
  | "initial"
  | "revert"
  | "revert-layer"
  | "unset";

type Align =
  | "normal"
  | "stretch"
  | "center"
  | "start"
  | "end"
  | "flex-start"
  | "flex-end"
  | "baseline"
  | "first baseline"
  | "last baseline"
  | "safe center"
  | "unsafe center"
  | "inherit"
  | "initial"
  | "revert"
  | "revert-layer"
  | "unset";
