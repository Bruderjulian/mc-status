import { resolveSrv } from "dns";
import { SRVRecord, ParsedAddress } from "./query/types.ts";

export const BASE_URL = "https://api.mcstatus.io/v2";
export const DEFAULT_TIMEOUT = 5000;
export const DEFAULT_PORT = 25565;
export const DEFAULT_BEDROCK_PORT = 19132;
export const DEFAULT_VOTE_PORT = 8192;
export const DEFAULT_RCON_PORT = 25575;
export const MAX_TIMEOUT = 600000; // 10min

export function parsePort(
  port: string | number | undefined
): number | undefined {
  if (!port) return;
  const parsed: number = parseInt(port.toString());
  if (isNaN(parsed) || parsed < 1 || parsed > 65535) return;
  return parsed;
}

const addressMatch = /^([^:]+)(?::(\d{1,5}))?$/;

export function parseAddress(
  value: string,
  defaultPort = 25565
): ParsedAddress | null {
  const match = value.match(addressMatch);
  if (!Array.isArray(match)) return null;
  const port = match[2] ? parsePort(match[2]) : defaultPort;
  if (!port || typeof match[1] === "string") return null;
  return {
    host: match[1],
    port,
  };
}

export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function defaults<T>(value: T | undefined | null, def: T): T {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "number" && isNaN(value))
  ) {
    return def;
  }
  return value;
}

export function resolveSRV(
  host: string,
  protocol: string = "tcp"
): Promise<SRVRecord | null> {
  return new Promise((resolve) => {
    resolveSrv(`_minecraft._${protocol}.${host}`, (error, addresses) => {
      if (error || !Array.isArray(addresses) || addresses.length < 1) {
        resolve(null);
      }
      const address = addresses[0];
      if (!address.name || !address.port) {
        resolve(null);
      }
      resolve({
        host: address.name,
        port: address.port,
        priority: address.priority,
        weight: address.weight,
        merged: `${address.name}:${address.port}`,
      });
    });
  });
}

export interface Packet {
  id: number;
  type: number;
  data: string;
}

export const PacketType = {
  Auth: 3,
  AuthResponse: 2,
  Command: 2,
  CommandResponse: 0,
} as const;

export function decodePacket(buffer: Buffer): Packet {
  const length = buffer.readInt32LE(0);
  const id = buffer.readInt32LE(4);
  const type = buffer.readInt32LE(8);
  const data = buffer.slice(12, length + 2).toString("utf8");
  return {
    id,
    type,
    data,
  };
}

export function createPacket(id: number, type: number, data: string): Buffer {
  const bodyBuffer = Buffer.from(data, "utf8");
  const buffer = Buffer.alloc(bodyBuffer.length + 14);
  buffer.writeInt32LE(bodyBuffer.length + 10, 0);
  buffer.writeInt32LE(id, 4);
  buffer.writeInt32LE(type, 8);
  buffer.write(data, 12, "utf8");
  buffer.writeInt8(0, bodyBuffer.length + 12);
  buffer.writeInt8(0, bodyBuffer.length + 13);
  return buffer;
}
