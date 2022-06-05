export type MaybeUnit = string | number;

export function autoUnit(input: MaybeUnit) {
  if (typeof input === "string") return input;

  if (input === 0) return "0";

  return `${input}px`;
}
