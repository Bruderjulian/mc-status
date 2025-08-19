function sum(input: string): number {
  let sum = 0;
  input = input.replace("#", "");

  const r = input.substring(0, 2);
  const g = input.substring(2, 4);
  const b = input.substring(4, 6);
  sum = Math.sqrt(
    parseInt(r, 16) ** 2 + parseInt(g, 16) ** 2 + parseInt(b, 16) ** 2
  );

  return sum;
}

export const colorNames: Record<string, string> = {
  black: "0",
  dark_blue: "1",
  dark_green: "2",
  dark_aqua: "3",
  dark_red: "4",
  dark_purple: "5",
  gold: "6",
  gray: "7",
  dark_gray: "8",
  blue: "9",
  green: "a",
  aqua: "b",
  red: "c",
  light_purple: "d",
  yellow: "e",
  white: "f",
  minecoin_gold: "g",
};

export const colorCodes: Record<string, string> = {
  "0": "black",
  "1": "dark_blue",
  "2": "dark_green",
  "3": "dark_aqua",
  "4": "dark_red",
  "5": "dark_purple",
  "6": "gold",
  "7": "gray",
  "8": "dark_gray",
  "9": "blue",
  a: "green",
  b: "aqua",
  c: "red",
  d: "light_purple",
  e: "yellow",
  f: "white",
  g: "minecoin_gold",
};

export const colorValues: Record<string, string> = {
  black: "#000000",
  dark_blue: "#0000AA",
  dark_green: "#00AA00",
  dark_aqua: "#00AAAA",
  dark_red: "#AA0000",
  dark_purple: "#AA00AA",
  gold: "#FFAA00",
  gray: "#AAAAAA",
  dark_gray: "#555555",
  blue: "#5555FF",
  green: "#55FF55",
  aqua: "#55FFFF",
  red: "#FF5555",
  light_purple: "#FF55FF",
  yellow: "#FFFF55",
  white: "#FFFFFF",
};

interface CompiledColor {
  name: string;
  code: string;
  hex: string;
  sum: number;
}

let compiledColors: CompiledColor[] = [];
for (let key of Object.keys(colorNames)) {
  compiledColors.push({
    name: key,
    code: colorCodes[key],
    hex: colorValues[key],
    sum: sum(colorValues[key]),
  });
}

export function closest(input: string): CompiledColor | null {
  const colorSum = sum(input);
  let closest: CompiledColor | null = null;
  let lastDifference = Infinity;

  for (const color of this.list) {
    const diff = Math.abs(colorSum - color.sum);

    if (closest === null || diff < lastDifference) {
      closest = color;

      lastDifference = diff;
    }
  }

  return closest;
}
