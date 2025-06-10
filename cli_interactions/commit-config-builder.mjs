import { CONFIG_PRESETS } from "./constants.mjs";
import { QuestionHelper } from "./question-helper.mjs";
import { UserInstructions } from "./user-instructions.mjs";

export class CommitConfigBuilder {
    constructor() {
      this.config = {};
    }

    async build() {
      // Show the welcome banner and get user choice
      const userInstructions = new UserInstructions();
      await userInstructions.print();
      
      // If user just pressed Enter (empty) or didn't type 'c', use defaults
      const wantsCustom = userInstructions.userResponse === 'c';
      
      if (!wantsCustom) {
        console.log('Using default configuration');
        return CONFIG_PRESETS.default;
      }
      
      // User wants to configure - show options
      console.log('Building custom configuration...');
      
      // First determine the mode
      const mode = await QuestionHelper.choice(
        'What are you generating?',
        ['commit', 'mr'],
        'commit'
      );
      
      if (mode === 'mr') {
        return { mode: 'mr', format: 'plain', explainDesign: true, isPreset: false };
      }
      
      // Get commit message style
      const style = await QuestionHelper.choice(
        'Commit message style?',
        ['quick', 'detailed', 'custom'],
        'quick'
      );
      
      if (style !== 'custom') {
        console.log(`✅ Using "${style}" preset`);
        return { ...CONFIG_PRESETS[style], mode: 'commit' };
      }
      
      // Build fully custom config
      console.log('🛠️ Building fully custom configuration...');
      return await this.buildCustomConfig();
    }
  
    async buildCustomConfig() {
      const longform = await QuestionHelper.ask('Use detailed narrative format? (y/n*) ', 'n');
      const explainDesign = await QuestionHelper.ask('Add design rationale? (y/n*) ', 'n');
      const internal = explainDesign ? await QuestionHelper.ask('Internal/WIP mode? (y/n*) ', 'n') : false;
      const changelog = !internal ? await QuestionHelper.ask('Changelog mode (user-visible only)? (y/n*)', 'n') : false;
      
      // Handle max lines input
      const maxLinesInput = await QuestionHelper.ask('Set max # of lines? (y*/n)', 'y');
      let maxLines = null;
      if (maxLinesInput !== 'n') {
        maxLines = await QuestionHelper.askCustomInput('Enter max # of lines: ', '');
        maxLines = parseInt(maxLines);
      }
      
      return {
        mode: 'commit',
        longform,
        format: 'plain',
        explainDesign,
        internal,
        changelog,
        maxLines,
        isPreset: false,
      };
    }    
}
