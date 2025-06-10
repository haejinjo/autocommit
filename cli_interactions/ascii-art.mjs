// In ascii-art.mjs - add this method
export class AsciiArt {
  static welcomeBanner() {
    const taglines = [
      'Commit smarter, not harder ✨💾',
      'You wrote it. Now help Future You understand it. 🕰️🧩',
      'Turning "wtf did I do" into "ahh, that\'s what I did" 😌💡',
      'Let commits speak for you 📜🗣️',
      'Commit messages that stop archaeology 🦕🔍',
      'One good commit message may save someone an hour 🫶',
      'Take a moment to document ☕️🧠',
      'Sins of omission haunt your git blame 👻\nConfess now, or repent at merge-time🧎',
      'Do the right thing or be lazy? Why not both? 🌮🌮'
    ];

    const centerText = (text, width) => {
      const lines = text.split('\n');
      return lines.map(line => {
        const pad = Math.floor((width - line.length) / 2);
        return ' '.repeat(Math.max(pad, 0)) + line;
      }).join('\n');
    };
    
    const taglineLines = taglines.flatMap(t => t.split('\n'));
    const maxLineLength = Math.max(...taglineLines.map(l => l.length));
    const boxWidth = maxLineLength + 4;
    
    const randomTagline = taglines[Math.floor(Math.random() * taglines.length)];
    const taglineCenteredLines = randomTagline
      .split('\n')
      .map(line => ` ${line.padStart(Math.floor((boxWidth + line.length) / 2)).padEnd(boxWidth)} `)
      .join('\n');
    
    const borderLine = '╭' + '─'.repeat(boxWidth) + '╮';
    const footerLine = '╰' + '─'.repeat(boxWidth) + '╯';
    
    const asciiArt = centerText('｡･:*:･ﾟ★,｡･:*:･ﾟ☆👋 Welcome to AutoCommit CLI 😎☆ﾟ･:*:｡,★ﾟ･:*:｡', boxWidth);
    
    return `\n${asciiArt}\n${borderLine}\n${taglineCenteredLines}\n${footerLine}\n`;
  }

  static wrapContent(content, isRetry = false) {
    const retryIndicator = isRetry ? '\n🔄 RETRY\n' : '';
    const border = '🤖 ' + '─'.repeat(60) + ' 🤖';
    
    return `${retryIndicator}\n${border}\n${content}\n${border}\n`;
  }
}