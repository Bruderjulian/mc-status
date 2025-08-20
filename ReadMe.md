# mc-server-utils

Various Utilities for MC servers to retrieve status, queries, and RCON into servers.
Also parse, format, clean and convert a Minecraft MOTD into HTML.

This package contains code from

- (minecraft-server-util)[https://www.npmjs.com/package/minecraft-server-util]
- (minecraft-motd-util)[https://www.npmjs.com/package/minecraft-motd-util]

## Installation

```bash
npm install mc-server-utils
```

## Usage

Everything you need to know to get started is located within a documentation website: https://passthemayo.gitbook.io/minecraft-server-util/ (assuming it's still up)

## Query

The Query API allows you to retrieve information about Minecraft servers (both Java and Bedrock editions).
**Note:** Make sure the server is configured to provide queries and statuses!!

### Available Methods

- `queryJava(options)`
- `queryBedrock(options)`
- `getIcon(options)`
- `getWidgetJava(options)`
- `getWidgetBedrock(options)`

### Example Usage

```js
import { queryJava, queryBedrock } from "mc-server-utils";

// Query a Java Edition server
const javaStatus = await queryJava({
  host: "example.server.net",
  port: 25565, // default Java port
});
console.log(javaStatus);

// Query a Bedrock Edition server
const bedrockStatus = await queryBedrock({
  host: "example.server.net",
  port: 19132, // default Bedrock port
});
console.log(bedrockStatus);
```

#### Get Server Icon

```js
import { getIcon } from "mc-server-utils";

const icon = await getIcon({
  host: "example.server.net",
  port: 25565,
});
console.log(icon); // base64-encoded PNG
```

#### Get Server Widget

```js
import { getWidgetJava, getWidgetBedrock } from "mc-server-utils";

const widgetJava = await getWidgetJava({ host: "example.server.net" });
const widgetBedrock = await getWidgetBedrock({ host: "example.server.net" });
console.log(widgetJava, widgetBedrock);
```

---

### Available Methods & Options

#### `queryJava(options)`

- `host` (string, required): Server hostname or IP.
- `port` (number, optional): Server port (default: 25565).
- `timeout` (number, optional): Timeout in milliseconds (default: 1000).
- `query` (boolean, optional): Only retrieve status or full query (default: true)
- `sessionID` (number, optional): Custom session ID for the query.

#### `queryBedrock(options)`

- `host` (string, required): Server hostname or IP.
- `port` (number, optional): Server port (default: 19132).
- `timeout` (number, optional): Timeout in milliseconds (default: 1000).
- `query` (boolean, optional): Only retrieve status or full query (default: true)

#### `getIcon(options)`

- `host` (string, required): Server hostname or IP.
- `port` (number, optional): Server port (default: 25565).
- `timeout` (number, optional): Timeout in milliseconds (default: 1000).

#### `getWidgetJava(options)`

- `host` (string, required): Server hostname or IP.
- `port` (number, optional): Server port (default: 25565).
- `timeout` (number, optional): Timeout in milliseconds (default: 1000).

#### `getWidgetBedrock(options)`

- `host` (string, required): Server hostname or IP.
- `port` (number, optional): Server port (default: 19132).
- `timeout` (number, optional): Timeout in milliseconds (default: 1000).

### Example Usage

```js
import { queryJava, queryBedrock } from "mc-server-utils";

// Query a Java Edition server
const javaStatus = await queryJava({
  host: "example.server.net",
  port: 25565,
  timeout: 2000,
  enableSRV: true,
  sessionID: 12345,
});
console.log(javaStatus);

// Query a Bedrock Edition server
const bedrockStatus = await queryBedrock({
  host: "example.server.net",
  port: 19132,
  timeout: 2000,
  enableSRV: false,
});
console.log(bedrockStatus);
```

#### Get Server Icon

```js
import { getIcon } from "mc-server-utils";

const icon = await getIcon({
  host: "example.server.net",
  port: 25565,
  timeout: 1000,
  enableSRV: true,
});
console.log(icon); // base64-encoded PNG
```

#### Get Server Widget

```js
import { getWidgetJava, getWidgetBedrock } from "mc-server-utils";

const widgetJava = await getWidgetJava({ host: "example.server.net" });
const widgetBedrock = await getWidgetBedrock({ host: "example.server.net" });
console.log(widgetJava, widgetBedrock);
```

---

## Vote

The Vote API allows you to send vote notifications to Minecraft servers that support the Votifier protocol.  
**Note:** Make sure the server is configured to accept votes and you have the correct Votifier token and port.

### Available Methods & Options

#### `sendVote(options)`

- `host` (string, required): Server hostname or IP.
- `port` (number, required): Votifier port (default: 8192).
- `token` (string, required): Votifier token (for Votifier v2+).
- `username` (string, required): Minecraft username of the voter.
- `timeout` (number, optional): Timeout in milliseconds (default: 1000).

### Example Usage

```js
import { sendVote } from "mc-server-utils";

const result = await sendVote({
  host: "example.server.net",
  port: 8192,
  token: "your-votifier-token",
  username: "PlayerName",
  timeout: 2000,
});
console.log(result); // true if successful
```

---

## RCON

RCON allows you to send and receive console commands by interfacing with the server over a remote connection. RCON is secured using a password and a port (typically changed from the default 25575). RCON is dangerous because it allows you to execute commands with unrestricted privilege, such as if you were an operator on the server.

```js
import { RCON } from "mc-server-utils";

const client = new RCON({
  host: "example.server.net"
  port: 25565
  password: "1234"
});
// it automatically connects and authenticates if `autoConnect` is not set to `false`

const result = await client.run("time query daytime");
console.log(result);
```

### RCON Client

you can create a RCON Client in two ways:

```js
import { RCON } from "mc-server-utils";

const client = new RCON({});
// or
const client = RCON.connect({});
```

## Connecting & Login

to run commands, you need to connect and login with password! If you run commands before that they will be queued!

```js
import { RCON } from "mc-server-utils";

const client = new RCON({
  host: "example.server.net"
  port: 25565
  password: "1234"
});

// or
const client = new RCON({
  autoConnect: false
});
await client.connect({
  host: "example.server.net"
  port: 25565
  password: "1234",
});

// you can check if it is connected with: `isConnected()`
console.log(client.isConnected());
```

### Sending Commands

you can now send a minecraft command with `send`! But you can also provide a callback that gets resolved when the server sends a response or await it.

```js
// no response
client.send("time query daytime");

// with response (callback)
client.send("time query daytime", function (response) {
  console.log(response);
});

// await
const response = await client.send("time query daytime");
```

### disconnect

when finished, you should disconnected the client!

```js
client.disconnect();
```

---

## Motd

### Parsing

`parse(input, options)` will parse an MOTD into an array of tokens for easier formatting and generic use. The result of this method can be used as an argument to any other utility that uses an MOTD input. You can supply either a string or a [Chat](https://wiki.vg/Chat) object as the input.

```js
import { parse } from "mc-server-utils";

// Defaults
const options = {
  formattingCharacter: "§",
};

const result = parse("§k;;; §cA §a§lMinecraft §cServer §r§k;;;", options); // `options` is optional

console.log(result);
// => [
//        { text: ';;; ', color: 'white', obfuscated: true },
//        { text: 'A ', color: 'red' },
//        { text: 'Minecraft ', color: 'green', bold: true },
//        { text: 'Server ', color: 'red' },
//        { text: ';;;', color: 'white', obfuscated: true }
//    ]
```

### Formatting

`format(input, options)` will format the parsed tree or string back into a normalized string with the provided formatting character. Note that this method will prefer resetting color over using `§r`.

```js
import { format } from "mc-server-utils";

// Defaults
const options = {
  formattingCharacter: "§",
};

const result = format(result, options); // `options` is optional, `result` assumed from example above

console.log(result);
// => '§f§k;;; §cA §a§lMinecraft §cServer §f§k;;;'
```

### Clean

`clean(tree, options)` will remove all formatting codes and characters from the string with the implied formatting character.

```js
import { clean } from "mc-server-utils";

// Defaults
const options = {
  formattingCharacter: "§",
};

const result = clean(result, options); // `options` is optional, `result` assumed from example above

console.log(result);
// => ';;; A Minecraft Server ;;;'
```

### Convert to HTML

`toHTML(input, options)` will convert the formatted string or parsed MOTD into an HTML string.

```js
import { toHTML } from 'mc-server-utils';

// Defaults
const options = {
    serializers: { ... }, // see `types.ts` for documentation
    rootTag: 'span'
};

const result = toHTML(result, options); // `options` is optional, `result` assumed from example above

console.log(result);
// => '<span><span class="minecraft-formatting-obfuscated" style="color: #FFFFFF;">;;; </span><span style="color: #FF5555;">A </span><span style="color: #55FF55; font-weight: bold;">Minecraft </span><span style="color: #FF5555;">Server </span><span class="minecraft-formatting-obfuscated" style="color: #FFFFFF;">;;;</span></span>'
```
