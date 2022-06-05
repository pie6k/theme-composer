import { css } from "../css/interpolator";
import { styledLeaf } from "../styleLeaf";
import { autoUnit, MaybeUnit } from "./utils";

function getIsAnyDefined(...values: any[]) {
  return values.some((value) => value !== undefined);
}

export const transform = styledLeaf(() => {
  return css`
    will-change: transform;
  `;
})
  .prop<"x", MaybeUnit>("x")
  .prop<"y", MaybeUnit>("y")
  .prop<"z", MaybeUnit>("z")
  .prop<"rotate", MaybeUnit>("rotate")
  .prop<"rotateX", MaybeUnit>("rotateX")
  .prop<"rotateY", MaybeUnit>("rotateY")
  .prop<"rotateZ", MaybeUnit>("rotateZ")
  .prop<"scale", MaybeUnit>("scale")
  .prop<"scaleX", MaybeUnit>("scaleX")
  .prop<"scaleY", MaybeUnit>("scaleY")
  .prop<"scaleZ", MaybeUnit>("scaleZ")
  .prop<"skewX", MaybeUnit>("skewX")
  .prop<"skewY", MaybeUnit>("skewY")
  .prop("perspective", (perspective: MaybeUnit) => {
    return css`
      perspective: ${autoUnit(perspective)};
    `;
  })
  .prop("origin", (origin: string) => {
    return css`
      transform-origin: ${origin};
    `;
  })
  .done(
    ({
      x,
      y,
      z,
      rotate,
      rotateX,
      rotateY,
      rotateZ,
      scale,
      scaleX,
      scaleY,
      scaleZ,
      skewX,
      skewY,
    }) => {
      const transforms: string[] = [];

      if (getIsAnyDefined(x, y, z)) {
        x = autoUnit(x ?? 0);
        y = autoUnit(y ?? 0);
        z = autoUnit(z ?? 0);
        transforms.push(`translate3d(${x}, ${y}, ${z})`);
      }

      // Rotate

      if (rotate) {
        transforms.push(`rotate(${autoUnit(rotate)})`);
      }

      if (rotateX) {
        transforms.push(`rotateX(${autoUnit(rotateX)})`);
      }

      if (rotateY) {
        transforms.push(`rotateY(${autoUnit(rotateY)})`);
      }

      if (rotateZ) {
        transforms.push(`rotateZ(${autoUnit(rotateZ)})`);
      }

      // Scale

      if (scale) {
        transforms.push(`scale(${autoUnit(scale)})`);
      }

      if (scaleX) {
        transforms.push(`scaleX(${autoUnit(scaleX)})`);
      }

      if (scaleY) {
        transforms.push(`scaleY(${autoUnit(scaleY)})`);
      }

      if (scaleZ) {
        transforms.push(`scaleZ(${autoUnit(scaleZ)})`);
      }

      // Skew

      if (skewY) {
        transforms.push(`skewY(${autoUnit(skewY)})`);
      }

      if (skewX) {
        transforms.push(`skewX(${autoUnit(skewX)})`);
      }

      return css`
        transform: ${transforms.join(" ")};
      `;
    }
  );
