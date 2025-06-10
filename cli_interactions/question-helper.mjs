// cli_interactions/question-helper.mjs
import { getReadlineInterface } from './readline-singleton.mjs';

export class QuestionHelper {
  static async ask(question, defaultValue, condition = true) {
    if (!condition) return false;
    
    const rl = getReadlineInterface();
    const response = await rl.question(`${question} `, defaultValue);
    return this.parseResponse(response, defaultValue);
  }
  
  static async askCustomInput(question, defaultValue, condition = true) {
    if (!condition) return false;
    
    const rl = getReadlineInterface();
    const response = await rl.question(`${question} `, defaultValue);
    return this.parseCustomResponse(response, defaultValue);
  }

  static async choice(question, options, defaultOption) {
    const optionsStr = options.map(opt => 
      opt === defaultOption ? `(${opt.toUpperCase()}*)` : `(${opt.toUpperCase()})`
    ).join(' or ');
    
    const rl = getReadlineInterface();
    const response = await rl.question(`${question} ${optionsStr}: `, defaultOption);
    
    const normalizedResponse = (response || '').toLowerCase().trim();
    return normalizedResponse || defaultOption;
  }

    static parseResponse(response, defaultValue) {
      const normalized = response.toLowerCase().trim();
      if (normalized === '') return defaultValue.toLowerCase() === 'y';
      return ['y', 'yes', 'true'].includes(normalized);
    }

    static parseCustomResponse(response, defaultValue) {
      const normalized = response.toLowerCase().trim();
      if (normalized === '') return defaultValue.toLowerCase();
      return normalized;
    }
}