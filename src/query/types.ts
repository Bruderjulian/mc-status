export interface JavaQueryOptions {
  query?: boolean;
  timeout?: number;
}

export interface BedrockQueryOptions {
  timeout?: number;
}

export interface WidgetOptions {
  dark?: boolean;
  transparent?: boolean;
  rounded?: boolean;
  timeout?: number;
}

export interface VoteOptions {
  host: string;
  port?: number;
  token: string;
  publickey?: string;
  username: string;
  uuid?: string;
  timeout?: number;
}

export interface QueryResponse {
  online: boolean;
  host: string;
  port: number;
  eula_blocked: boolean;
  retrieved_at: number;
  expires_at: number;
  latency: number;
}

export interface SRVRecord {
  host: string;
  port: number;
  priority: number;
  weight: number;
  merged: string;
}

export interface ParsedAddress {
	host: string,
	port: number
}


export type BedrockEdition = "MCPE" | "MCEE" | null;

export interface JavaQueryResponse extends QueryResponse {
  version: {
    name: string;
    protocol: number;
  };
  players: {
    online: number;
    max: number;
    list:
      | {
          uuid: string;
          name_raw: string;
          name_clean: string;
          name_html: string;
        }[]
      | null;
  };
  motd: {
    raw: string;
    clean: string;
    html: string;
  };
  mods?: {
    name: string;
    version: string;
  }[];
  plugins?: {
    name: string;
    version: string;
  }[];
  software?: string;
  icon: string | null;
  srvRecord: SRVRecord | null;
}

export interface BedrockQueryResponse extends QueryResponse {
  motd: {
    raw: string;
    clean: string;
    html: string;
  };
  version: {
    name: string | null;
    protocol: number | null;
  };
  players: {
    online: number;
    max: number;
  };
  //serverGUID: bigint,
  serverID: string | null;
  gameMode: string | null;
  gameModeID: number;
  edition: BedrockEdition;

  //portIPv4: number | null,
  //portIPv6: number | null,
  srvRecord: SRVRecord | null;
}
