import {
  BedrockQueryResponse,
  JavaQueryOptions,
  JavaQueryResponse,
  VoteOptions,
  WidgetOptions,
} from "./types.ts";
import {
  isObject,
  parsePort,
  BASE_URL,
  DEFAULT_BEDROCK_PORT,
  DEFAULT_PORT,
  DEFAULT_VOTE_PORT,
  defaults,
} from "../utils.ts";

export async function sendVote(options: VoteOptions): Promise<string> {
  if (!isObject(options)) {
    throw new TypeError("Options must be an object");
  }
  if (typeof options.host !== "string") {
    throw new TypeError("Invalid Host");
  }
  if (typeof options.token !== "string") {
    throw new TypeError("Invalid Token");
  }
  if (typeof options.username !== "string") {
    throw new TypeError("Invalid Username");
  }
  const port = defaults(parsePort(options.port), DEFAULT_VOTE_PORT);
  const publickey = defaults(options.publickey, "");
  const uuid = defaults(options.uuid, "");
  try {
    const result = await fetch(
      `${BASE_URL}/vote?host=${options.host}&port=${port}&token=${
        options.token
      }&timestamp=${new Date().toISOString()}${
        publickey ? "&publickey=" + publickey : ""
      }&username=${options.username}${uuid ? "&uuid=" + uuid : ""}}`,
      {
        method: "GET",
      }
    );
    if (result.body === null || result.status !== 200) {
      throw new Error("Invalid response: " + result.body);
    }
    return await result.text();
  } catch (err) {
    throw new Error("Failed to fetch icon: " + err);
  }
}

export async function getIcon(host: string, port?: number): Promise<Blob> {
  if (typeof host !== "string") {
    throw new TypeError("Invalid Host");
  }
  port = defaults(parsePort(port), DEFAULT_PORT);
  try {
    const result = await fetch(`${BASE_URL}/icon/${host}:${port}`, {
      method: "GET",
    });
    if (result.body === null || result.status !== 200) {
      throw new Error("Invalid response: " + result.body);
    }
    return await result.blob();
  } catch (err) {
    throw new Error("Failed to fetch icon: " + err);
  }
}

export async function getWidgetJava(
  host: string,
  port?: number,
  options?: WidgetOptions
): Promise<Blob> {
  if (typeof host !== "string") {
    throw new TypeError("Invalid Host");
  }
  port = defaults(parsePort(port), DEFAULT_PORT);
  if (options && !isObject(options)) {
    throw new TypeError("Options must be an object");
  }
  const dark = defaults(options?.dark, true);
  const transparent = defaults(options?.transparent, false);
  const rounded = defaults(options?.rounded, true);

  try {
    const result = await fetch(
      `${BASE_URL}/widget/java/${host}:${port}?dark=${dark}&transparent=${transparent}&rounded=${
        rounded ?? true
      }`,
      {
        method: "GET",
      }
    );
    const body = await result.blob();
    if (body === null || result.status !== 200) {
      throw new Error("Invalid response: " + body);
    }
    return body;
  } catch (err) {
    throw new Error("Failed to fetch Java widget: " + err);
  }
}

export async function getWidgetBedrock(
  host: string,
  port?: number,
  options?: WidgetOptions
): Promise<Blob> {
  if (typeof host !== "string") {
    throw new TypeError("Invalid Host");
  }
  port = defaults(parsePort(port), DEFAULT_BEDROCK_PORT);
  if (options && !isObject(options)) {
    throw new TypeError("Options must be an object");
  }
  const dark = defaults(options?.dark, true);
  const transparent = defaults(options?.transparent, false);
  const rounded = defaults(options?.rounded, true);

  try {
    const result = await fetch(
      `${BASE_URL}/widget/bedrock/${host}:${port}?dark=${dark}&transparent=${transparent}&rounded=${rounded}`,
      {
        method: "GET",
      }
    );
    const body = await result.blob();
    if (body === null || result.status !== 200) {
      throw new Error("Invalid response: " + body);
    }
    return body;
  } catch (err) {
    throw new Error("Failed to fetch Bedrock widget: " + err);
  }
}

export async function queryJava(
  host: string,
  port?: number,
  options?: JavaQueryOptions
): Promise<JavaQueryResponse> {
  if (typeof host !== "string") {
    throw new TypeError("Invalid Host");
  }
  port = defaults(parsePort(port), DEFAULT_PORT);
  if (options && !isObject(options)) {
    throw new TypeError("Options must be an object");
  }
  const query = defaults(options?.query, true);
  try {
    let startTime = Date.now();
    const result = await fetch(
      `${BASE_URL}/status/java/${host}:${port}?query=${query}`,
      {
        method: "GET",
      }
    );
    const body = (await result.json()) as JavaQueryResponse;
    if (body === null || result.status !== 200) {
      throw new Error("Invalid response: " + body);
    }
    body.latency = Math.max(Date.now() - startTime, 0);
    return body;
  } catch (err) {
    throw new Error("Failed to fetch Java status: " + err);
  }
}

export async function queryBedrock(
  host: string,
  port?: number
): Promise<BedrockQueryResponse> {
  if (typeof host !== "string") {
    throw new TypeError("Invalid Host");
  }
  port = defaults(parsePort(port), DEFAULT_BEDROCK_PORT);
  try {
    let startTime = Date.now();
    const result = await fetch(`${BASE_URL}/status/bedrock/${host}:${port}`, {
      method: "GET",
    });
    const body = (await result.json()) as BedrockQueryResponse;
    if (body === null || result.status !== 200) {
      throw new Error("Invalid response: " + body);
    }
    body.latency = Math.max(Date.now() - startTime, 0);
    return body;
  } catch (err) {
    throw new Error("Failed to fetch Bedrock status: " + err);
  }
}
