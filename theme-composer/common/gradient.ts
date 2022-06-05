import { css } from "../css/interpolator";
import { styledLeaf } from "../styleLeaf";

interface GradientStep {
  color: string;
  progress: number;
}

type GradientSteps = string[] | GradientStep[];

function resolveGradientSteps(input: GradientSteps): GradientStep[] {
  const isStringsArray = input.some(() => typeof input === "string");

  if (!isStringsArray) {
    return input as GradientStep[];
  }

  const stepsCount = input.length;

  const steps: GradientStep[] = input.map((color, index) => {
    const progress: number = index / stepsCount;

    return { color: color as string, progress };
  });

  return steps;
}

function getGradientBackground(steps: GradientStep[], direction: number) {
  const stepColors = steps.map((step) => {
    return `${step.color}`;
  });

  return css`
    background-image: linear-gradient(
      ${direction}deg,
      ${stepColors.reverse().join(",")}
    );
  `;
}

export const gradient = styledLeaf()
  .requiredProp<"steps", GradientSteps>("steps")
  .prop<"direction", number>("direction")
  .flag("asBg", ({ direction = 45, steps }) => {
    return getGradientBackground(resolveGradientSteps(steps), direction);
  })
  .flag("asTextBg", ({ direction = 45, steps }) => {
    return css`
      ${getGradientBackground(resolveGradientSteps(steps), direction)};
      background-size: 100%;
      -webkit-text-fill-color: transparent;
      text-fill-color: transparent;
      -webkit-background-clip: text;
      background-clip: text;
    `;
  })
  .done();
