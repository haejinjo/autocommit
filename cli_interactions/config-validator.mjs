import { QuestionHelper } from "./question-helper.mjs";

class ConfigValidator {
    static validate(config) {
      const errors = [];
      
      if (config.maxLines && (config.maxLines < 1 || config.maxLines > 20)) {
        errors.push('Max lines must be between 1 and 20');
      }
      
      if (config.internal && config.changelog) {
        errors.push('Cannot use both internal and changelog modes');
      }
      
      return errors;
    }
    
    static async validateAndFix(config) {
      const errors = this.validate(config);
      if (errors.length === 0) return config;
      
      console.log('⚠️  Configuration issues:', errors.join(', '));
      const fix = await QuestionHelper.ask('Auto-fix configuration?', 'y');
      
      if (fix) {
        return this.autoFix(config);
      }
      
      throw new Error('Invalid configuration');
    }
  }