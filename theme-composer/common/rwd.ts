import { css } from "../css/interpolator";
import { styledLeaf } from "../styleLeaf";

export const font = styledLeaf()
  .prop("family", (family: string) => {
    return css`
      font-family: ${family};
    `;
  })
  .prop("weight", (weight: string) => {
    return css`
      font-weight: ${weight};
    `;
  })
  .flag("normal", () => {
    return css`
      font-weight: normal;
    `;
  })
  .flag("bold", () => {
    return css`
      font-weight: bold;
    `;
  })
  .flag("normal", () => {
    return css`
      font-weight: normal;
    `;
  })
  .flag("lighter", () => {
    return css`
      font-weight: lighter;
    `;
  })
  .flag("w100", () => {
    return css`
      font-weight: 100;
    `;
  })
  .flag("w200", () => {
    return css`
      font-weight: 200;
    `;
  })
  .flag("w300", () => {
    return css`
      font-weight: 300;
    `;
  })
  .flag("w400", () => {
    return css`
      font-weight: 400;
    `;
  })
  .flag("w500", () => {
    return css`
      font-weight: 500;
    `;
  })
  .flag("w600", () => {
    return css`
      font-weight: 600;
    `;
  })
  .flag("w700", () => {
    return css`
      font-weight: 700;
    `;
  })
  .flag("w800", () => {
    return css`
      font-weight: 800;
    `;
  })
  .flag("w900", () => {
    return css`
      font-weight: 900;
    `;
  })
  .flag("w100", () => {
    return css`
      font-weight: 100;
    `;
  })
  // Transform
  .flag("uppercase", () => {
    return css`
      text-transform: uppercase;
    `;
  })
  .flag("capitalize", () => {
    return css`
      text-transform: capitalize;
    `;
  })
  .flag("lowercase", () => {
    return css`
      text-transform: lowercase;
    `;
  })
  .flag("underline", () => {
    return css`
      text-decoration: underline;
    `;
  })
  .done();

type Weight =
  | "normal"
  | "bold"
  | "lighter"
  | "bolder"
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;
