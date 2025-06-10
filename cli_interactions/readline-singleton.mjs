import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

let rlInstance = null;

export function getReadlineInterface() {
  if (!rlInstance) {
    rlInstance = readline.createInterface({ input, output });
  }
  return rlInstance;
}

export function closeReadlineInterface() {
  if (rlInstance) {
    rlInstance.close();
    rlInstance = null;
  }
}