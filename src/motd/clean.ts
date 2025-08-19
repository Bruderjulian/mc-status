import { CleanOptions, ParseItem } from "./types";

export const clean = (
  text: ParseItem[] | string,
  options?: CleanOptions
): string => {
  if (typeof text !== "string" && !Array.isArray(text)) {
    throw new TypeError("Invalid Text Input");
  }
  options = Object.assign(
    {
      formattingCharacter: "\u00A7",
    },
    options
  );

  if (typeof text === "string") {
    return text.replace(
      new RegExp(`${options.formattingCharacter}[0-9a-gk-or]`, "g"),
      ""
    );
  }

  return text.map((item) => item.text).join("");
};
