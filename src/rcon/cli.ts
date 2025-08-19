#! /usr/bin/env node

import { RCON } from './rcon.ts';
import readline from 'readline';

const RCON_HOST = 'lemonlight.g-portal.game';
const RCON_PORT = 32275;
const RCON_PASS = 'etHNfS7P';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '\u001b[33m' + 'RCON> ' + '\u001b[0m'
});

const connection = new RCON({
  host: RCON_HOST,
  port: RCON_PORT,
  password: RCON_PASS
});

console.log(`Connecting to ${RCON_HOST}:${RCON_PORT}`);

connection.on('authenticated', () => {
  rl.prompt();
});

connection.on('connect', () => {
  console.log('Connected');
});
  
connection.on('response', (res) => {
  console.log(res);
  rl.prompt();
});

connection.on('error', () => {})
  
connection.on('disconnect', () => {
  console.log('Socket closed');
  process.exit();
});

const quitCmds = ['exit', 'quit', ".exit", ".quit"];
rl.on('line', (line) => {
  if (quitCmds.includes(line.trim())) {
    connection.disconnect();
    return;
  }
  if (!connection.isConnected()) {
    console.log('Not connected to RCON server.');
    rl.prompt();
    return;
  }
  if (line.trim() === 'clear') {
    console.clear();
    rl.prompt();
    return;
  }

	connection.send(line);
});