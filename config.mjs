import { readFileSync, existsSync } from 'fs';
import path from 'path';

export function loadConfig() {
  const rcPath = path.join(process.cwd(), '.autocommitrc');

  if (!existsSync(rcPath)) {
    console.log('⚠️ No .autocommitrc file found.');
    process.exit(1);
  }

  const content = readFileSync(rcPath, 'utf-8');
  const config = JSON.parse(content);

  return config;
}
