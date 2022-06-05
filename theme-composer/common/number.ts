import { css } from "../css/interpolator";
import { typedKeys } from "../leaf/utils";
import { styledLeaf } from "../styleLeaf";

function getValueWithUnit(value: number, unit?: string) {
  if (value === 0) return "0";
  if (!unit) {
    return `${value}px`;
  }

  return `${value}${unit}`;
}

function camelToDashed(camel: string) {
  return camel.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

const numberBase = styledLeaf()
  .requiredProp<"value", number>("value")
  .prop<"unit", string>("unit")
  .flag("margin")
  .flag("marginTop")
  .flag("marginBottom")
  .flag("marginLeft")
  .flag("marginRight")
  .flag("padding")
  .flag("paddingTop")
  .flag("paddingBottom")
  .flag("paddingLeft")
  .flag("paddingRight")
  .flag("top")
  .flag("bottom")
  .flag("left")
  .flag("width")
  .flag("maxWidth")
  .flag("height")
  .flag("minHeight")
  .flag("gap")
  .flag("rowGap")
  .flag("columnGap")
  .done(
    ({
      value,
      unit,
      margin,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      padding,
      paddingTop,
      paddingBottom,
      paddingLeft,
      paddingRight,
      top,
      bottom,
      left,
      width,
      maxWidth,
      height,
      minHeight,
      gap,
      rowGap,
      columnGap,
    }) => {
      const styles: string[] = [];
      const valueWithUnit = getValueWithUnit(value, unit);

      const properties = {
        margin,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        padding,
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
        top,
        bottom,
        left,
        width,
        maxWidth,
        height,
        minHeight,
        gap,
        rowGap,
        columnGap,
      };

      typedKeys(properties).forEach((property) => {
        const value = properties[property];

        if (value !== true) return;

        const styleProperty = camelToDashed(property);

        styles.push(`${styleProperty}: ${valueWithUnit};`);
      });

      return styles.join("\n");
    }
  );

export function number(value: number, unit?: string) {
  let leaf = numberBase.value(value);

  if (unit !== undefined) {
    leaf = leaf.unit(unit);
  }

  return leaf;
}
