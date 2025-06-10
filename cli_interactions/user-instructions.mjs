// Simplified UserInstructions class
import { loadConfig } from '../config.mjs';
import { getReadlineInterface } from './readline-singleton.mjs';
import { AsciiArt } from './ascii-art.mjs';

export class UserInstructions {
  constructor() {
    this.userResponse = null;
  }

  async response() {
    return this.userResponse;
  }

  async print() {
    const rl = getReadlineInterface();
    const config = loadConfig();

    const banner = AsciiArt.welcomeBanner();

    const instructionsMessage = await rl.question(
      banner +
      'This tool helps devs document their changes with better commit messages.\n' +
      'Use the default settings or configure to optimize for length or style.\n\n' +
      `\n(Current model: ${config.model}, Temp: ${config.temperature}, Target: ${config.targetBranch})\n` +
      '(Press Enter to generate default commit message. Press c to configure.): '
    );

    this.userResponse = instructionsMessage.trim().toLowerCase();
  }
}