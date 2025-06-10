export const CONFIG_PRESETS = {
    default: {
      longform: false,
      format: 'plain',
      explainDesign: true,
      internal: false,
      changelog: false,
      maxLines: 15
    },
    
    quick: {
      longform: false,
      format: null,
      explainDesign: false,
      internal: false,
      changelog: false,
      maxLines: 5
    },
    
    detailed: {
      longform: true,
      format: 'plain',
      explainDesign: true,
      internal: false,
      changelog: false,
      maxLines: 30
    }
  };
  