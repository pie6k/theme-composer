import { css } from "../css/interpolator";
import { styledLeaf } from "../styleLeaf";

import Color from "color";

interface ColorInfo {
  value: string;
  hover?: string;
  active?: string;
  readableText?: string;
}

function getColorHover(info: ColorInfo) {
  if (info.hover) {
    return info.hover;
  }

  return getColorHoverVariant(info.value);
}

function getColorActive(info: ColorInfo) {
  if (info.active) {
    return info.active;
  }

  return getColorActiveVariant(info.value);
}

export function color(info: ColorInfo) {
  return colorBase.info(info);
}

const colorBase = styledLeaf()
  .requiredProp<"info", ColorInfo>("info")
  .flag("hover", (data) => {
    data.info = { value: getColorHover(data.info) };
  })
  .flag("active", (data) => {
    data.info = { value: getColorActive(data.info) };
  })
  .prop("opacity", (opacity: number, data) => {
    data.info = { value: setColorOpacity(data.info!.value, opacity) };
  })
  .flag("readableText", (data) => {
    if (data.info!.readableText) {
      data.info = { value: data.info.readableText };
      return;
    }

    data.info = { value: getColorReadableText(data.info!.value) };
  })
  .flag("interactive")
  .flag("asColor", ({ interactive, info }) => {
    const base = css`
      color: ${info!.value};
    `;

    if (!interactive) return base;

    return css`
      ${base};
      &:hover {
        color: ${getColorHover(info)};
      }
      &:active {
        color: ${getColorActive(info)};
      }
    `;
  })
  .flag("asBg", ({ interactive, info }) => {
    const base = css`
      background-color: ${info!.value};
    `;

    if (!interactive) return base;

    return css`
      ${base};
      &:hover {
        background-color: ${getColorHover(info)};
      }
      &:active {
        background-color: ${getColorActive(info)};
      }
    `;
  })
  .done(({ asBg, asColor, info }) => {
    if (!asBg && !asColor) {
      return info.value;
    }
  });

function setColorOpacity(color: string, opacity: number): string {
  const parsedColor = new Color(color);
  return parsedColor
    .hsl()
    .fade(1 - opacity)
    .hsl()
    .toString();
}

function isColorDark(color: string): boolean {
  const parsedColor = new Color(color);
  return parsedColor.isDark();
}

function changeColorLightness(color: string, offset: number): string {
  const parsedColor = new Color(color);
  const currentLightness = parsedColor.lightness();

  return parsedColor
    .lightness(currentLightness + offset)
    .hsl()
    .toString();
}

function darkenColor(color: string, offset: number): string {
  const parsedColor = new Color(color);
  return parsedColor.hsl().darken(offset).rgb().toString();
}

const HOVER_COLOR_CHANGE = 4;

function getColorLightnessVariant(color: string, ratio = 1): string {
  if (isColorDark(color)) {
    return changeColorLightness(color, ratio);
  }

  return changeColorLightness(color, -ratio);
}

function getColorHoverVariant(color: string, ratio = 1): string {
  return getColorLightnessVariant(color, HOVER_COLOR_CHANGE * ratio);
}

function getColorActiveVariant(color: string): string {
  return getColorLightnessVariant(color, HOVER_COLOR_CHANGE * 1.5);
}

export function getColorReadableText(color: string) {
  if (isColorDark(color)) {
    return "hsl(0, 0%, 100%)";
  }

  return "hsl(0, 0%, 0%)";
}
