import { colorCodes } from "./colors";
import { ParseOptions, ParseItem, FormattingProperties, Chat } from "./types";

const formattingLookupProperties: Record<string, FormattingProperties> = {
  k: "obfuscated",
  l: "bold",
  m: "strikethrough",
  n: "underline",
  o: "italics",
};

function parseText(text: string, options: ParseOptions): ParseItem[] {
  const result: ParseItem[] = [{ text: "", color: "gray" }];
  let position = 0;

  while (position + 1 <= text.length) {
    const character = text.charAt(position);
    let item: ParseItem = result[result.length - 1];

    if (character === "\n") {
      result.push({ text: "\n", color: "gray" });
      position++;
      continue;
    }

    if (character !== options.formattingCharacter) {
      item.text += character;
      position++;
      continue;
    }

    const formattingCode = text.charAt(position + 1).toLowerCase();
    position += 2;

    if (formattingCode === "r") {
      result.push({ text: "", color: "gray" });
      continue;
    }

    if (formattingCode in formattingLookupProperties) {
      if (item.text.length > 0) {
        result.push({
          ...item,
          text: "",
          [formattingLookupProperties[formattingCode]]: true,
        });
      } else {
        item[formattingLookupProperties[formattingCode]] = true;
      }
    } else if (formattingCode in colorCodes) {
      result.push({ text: "", color: colorCodes[formattingCode] });
    }
  }

  return result;
}

function parseChat(
  chat: Chat,
  options: ParseOptions,
  parent?: Chat
): ParseItem[] {
  const result: ParseItem[] = parseText(
    chat.text || chat.translate || "",
    options
  );
  const item: ParseItem = result[0];

  if ((parent && parent.bold && !chat.bold) || chat.bold) {
    item.bold = true;
  }
  if ((parent && parent.italic && !chat.italic) || chat.italic) {
    item.italics = true;
  }
  if ((parent && parent.underlined && !chat.underlined) || chat.underlined) {
    item.underline = true;
  }
  if (
    (parent && parent.strikethrough && !chat.strikethrough) ||
    chat.strikethrough
  ) {
    item.strikethrough = true;
  }

  if ((parent && parent.obfuscated && !chat.obfuscated) || chat.obfuscated) {
    item.obfuscated = true;
  }

  if (chat.color) {
    item.color = colorCodes[chat.color] || chat.color;
  } else if (parent?.color) {
    item.color = colorCodes[parent.color] || parent.color;
  }

  chat.bold = !!item.bold;
  chat.italic = item.italics;
  chat.underlined = !!item.underline;
  chat.strikethrough = !!item.strikethrough;
  chat.obfuscated = !!item.obfuscated;
  chat.color = item.color;
  if (chat.extra) {
    for (const extra of chat.extra) {
      result.push(...parseChat(extra, options, chat));
    }
  }

  return result;
}

export function parse(
  input: Chat | string,
  options?: ParseOptions
): ParseItem[] {
  options = Object.assign(
    {
      formattingCharacter: "\u00A7",
    },
    options
  );

  let result: ParseItem[];
  switch (typeof input) {
    case "string": {
      result = parseText(input, options);
      break;
    }
    case "object": {
      result = parseChat(input, options);
      break;
    }
    default: {
      throw new Error("Unexpected server MOTD type: " + typeof input);
    }
  }

  return result.filter((item) => item.text.length > 0);
}
