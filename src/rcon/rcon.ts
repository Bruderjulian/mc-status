import EventEmitter from "events";
import {
  DEFAULT_RCON_PORT,
  DEFAULT_TIMEOUT,
  isObject,
  parsePort,
  createPacket,
  PacketType,
  defaults,
} from "../utils.ts";
import { Socket, createConnection } from "node:net";

class RconError extends Error {
  constructor(message = "") {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

interface QueuedPacket {
  id: number;
  packet: Buffer;
  resolve: () => void;
  reject: (error: Error) => void;
}

export interface RCONFullOptions {
  timeout?: number;
  autoConnect?: boolean;
  host: string;
  port: number | string;
  password: string;
}

export interface RCONPartialOptions {
  timeout?: number;
  autoConnect?: boolean;
}

export interface RCONConnectOptions {
  host: string;
  port: number | string;
  password: string;
}

export interface RCONEvents {
  on(event: "connect", listener: () => void): void;
  on(event: "authenticated", listener: () => void): void;
  on(event: "response", listener: (response: string) => void): void;
  on(event: "error", listener: (error: Error) => void): void;
  on(event: "disconnect", listener: () => void): void;
}

export class RCON extends EventEmitter implements RCONEvents {
  private timeout: number;
  private host: string;
  private port: number = DEFAULT_RCON_PORT;
  private password: string;

  private connected = false;
  private authenticated = false;
  private requestId = 0;

  private socket: Socket | null = null;
  private buffer = Buffer.alloc(0);
  private pending = new Map<number, (data: string) => void>();
  private queue: Array<QueuedPacket> = [];
  private timeoutHandler: NodeJS.Timeout | null = null;

  constructor(options: RCONFullOptions | RCONPartialOptions) {
    super();
    if (!isObject(options)) {
      throw new TypeError("RCON options must be an Object");
    }
    if (options.autoConnect && typeof options.autoConnect !== "boolean") {
      throw new TypeError("Invalid RCON autoConnect");
    }
    if (
      options.timeout &&
      (typeof options.timeout !== "number" ||
        options.timeout < 0 ||
        isNaN(options.timeout))
    ) {
      throw new TypeError("Invalid RCON Timeout");
    }
    this.timeout = defaults(options.timeout, DEFAULT_TIMEOUT);
    let autoConnect = defaults(options.autoConnect, true);
    if (autoConnect) {
      this.connect(options as RCONConnectOptions);
    }
  }
  public static async connect(
    options: RCONFullOptions | RCONPartialOptions
  ): Promise<RCON> {
    return new RCON(options);
  }

  public isConnected(): boolean {
    return this.socket !== null && this.connected && this.authenticated;
  }

  public async connect(options: RCONConnectOptions): Promise<void> {
    if (typeof options.host !== "string") {
      throw new TypeError("Invalid RCON host");
    }
    this.host = options.host;
    if (typeof options.password !== "string") {
      throw new TypeError("Invalid RCON Password");
    }
    this.password = options.password;
    if (options.port) {
      let tempPort = parsePort(options.port);
      if (!tempPort) {
        throw new TypeError("Invalid RCON Port");
      }
      this.port = tempPort;
    } else {
      this.port = DEFAULT_RCON_PORT;
    }

    return new Promise((resolve, reject) => {
      this.socket = createConnection(
        {
          host: this.host,
          port: this.port,
          timeout: this.timeout,
          //keepAlive: false,
        },
        () => {
          if (this.socket) this.socket.setKeepAlive(true);
          this.connected = true;
          this.emit("connect");
          this.authenticate().then(resolve).catch(reject);
        }
      );

      this.socket.on("data", (data) => this.onData(data));
      this.socket.on("error", (err) => this.emit("error", err));
      this.socket.on("end", () => this.disconnect());

      if (this.timeout) {
        this.socket.setTimeout(this.timeout, () => {
          if (this.connected) return;
          const err = new RconError("Connection timed out during connect");
          this.emit("error", err);
          this.disconnect();
          reject(err);
        });
      }
    });
  }

  private authenticate(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.timeoutHandler = setTimeout(() => {
        if (this.authenticated) return;
        const err = new RconError("Connection timed out during authentication");
        this.emit("error", err);
        this.disconnect();
        reject(err);
      }, this.timeout);

      const onFailedAuth = () => {
        this.disconnect();
        reject(new RconError("Authentication failed"));
      };
      const onAuthenticated = () => {
        this.off("failed-auth", onFailedAuth);
        this.authenticated = true;
        if (this.timeoutHandler) clearTimeout(this.timeoutHandler);
        resolve();
        this.processQueue();
      };

      this.once("failed-auth", onFailedAuth);
      this.once("authenticated", onAuthenticated);

      if (!this.socket || !this.connected) {
        return reject(new RconError("Not connected to the server"));
      }
      const id = ++this.requestId;
      const buffer = createPacket(id, PacketType.Auth, this.password);
      this.socket.write(buffer, (err) => {
        if (err) {
          this.disconnect();
          return reject(err);
        }
      });
    });
  }

  private onData(data: Buffer): void {
    if (this.buffer.length === 0) {
      this.buffer = data as Buffer<ArrayBuffer>;
    } else {
      this.buffer = Buffer.concat([this.buffer, data]);
    }
    while (this.buffer.length >= 4) {
      const size = this.buffer.readInt32LE(0);
      if (this.buffer.length < 4 + size) {
        break;
      }

      const packet = this.buffer.subarray(4, 4 + size);
      this.buffer = this.buffer.subarray(4 + size);

      const id = packet.readInt32LE(0);
      const type = packet.readInt32LE(4);

      if (type === PacketType.AuthResponse && !this.authenticated) {
        if (id === -1) {
          this.emit("failed-auth");
        } else if (id === this.requestId) {
          this.emit("authenticated");
        }
        continue;
      } else if (type === PacketType.CommandResponse && !this.authenticated) {
        // Minecraft sends an empty SERVERDATA_RESPONSE_VALUE before the auth response, which can be ignored.
        continue;
      }

      if (type === PacketType.CommandResponse) {
        const body = packet.toString("utf8", 8, packet.length - 2);
        const resolve = this.pending.get(id);
        if (resolve) {
          resolve(body);
          this.pending.delete(id);
          //this.processQueue();
        } else {
          this.emit("response", body);
        }
      }
    }
  }

  public send(command: string, callback?: (body: string) => {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const queueId = this.requestId++;
      const buffer = createPacket(queueId, PacketType.Command, command);
      this.queue.push({
        id: queueId,
        packet: buffer,
        resolve: (): void => {
          if (callback) this.pending.set(queueId, callback);
          resolve();
        },
        reject,
      });
      this.processQueue();
    });
  }

  private processQueue(): void {
    if (!this.socket || !this.connected || !this.authenticated) return;
    while (this.queue.length > 0) {
      const queued = this.queue.shift();
      if (!queued) continue;
      this.socket.write(queued.packet, (err) => {
        if (err && queued.reject) return queued.reject(err);
        if (queued.resolve) queued.resolve();
      });
    }
  }

  public disconnect(): void {
    if (this.timeoutHandler) clearTimeout(this.timeoutHandler);
    this.connected = false;
    this.authenticated = false;
    this.emit("disconnect");
    this.pending.clear();
    this.queue = [];
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.on("error", () => {});
      this.socket.destroy();
      this.socket.end();
      this.socket = null;
    }
  }
}
