import { parse } from "./parse.ts";
import { FormatOptions, ParseItem } from "./types.ts";
import { closest, colorNames } from "./colors.ts";

export const format = (
  input: string | ParseItem[],
  options?: FormatOptions
): string => {
  if (typeof input === "string") {
    input = parse(input, options);
  } else if (!Array.isArray(input)) {
    throw new SyntaxError("Invalid Input");
  }

  const opts = Object.assign(
    {
      formattingCharacter: "\u00A7",
      replaceNearestColor: true,
    },
    options
  );

  let result = "";

  for (const item of input) {
    if (item.color) {
      const formatColor = colorNames[item.color];

      if (formatColor) {
        result += opts.formattingCharacter + colorNames[item.color];
      } else if (opts.replaceNearestColor) {
        const newColor = closest(item.color);

        if (newColor) {
          const colorCode = colorNames[newColor.name];

          if (colorCode) {
            result += opts.formattingCharacter + colorCode;
          }
        }
      }
    }

    if (item.bold) {
      result += opts.formattingCharacter + "l";
    }
    if (item.italics) {
      result += opts.formattingCharacter + "o";
    }
    if (item.underline) {
      result += opts.formattingCharacter + "n";
    }
    if (item.strikethrough) {
      result += opts.formattingCharacter + "m";
    }
    if (item.obfuscated) {
      result += opts.formattingCharacter + "k";
    }
    result += item.text;
  }

  return result;
};
