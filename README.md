# AutoCommit CLI

This AI-powered devtool analyzes your staged Git changes and generates commit messages or PR/MR-ready descriptions, helping you document your changes with less headache.

Stop writing "fix stuff" and start writing commits that help your teammates (and your futre self) understand what you did.

Note: Use sparingly, when it makes sense to. If you can write a perfectly good commit message for a simple commit, do that instead. AutoCommit is best for those who prefer to do large commits or those in situations where they want to remember the details for an important milestone change.

## Features
- Commit vs PR/MR mode - Generate anything from a concise commit message to a full on code-review-ready change request description
- Interactive workflow - accept, edit (in nano), or retry generated messages (enjoy the step-by-step progress indicators)
- Model Support - Works with OpenAI GPT or Anthropic Claude -- just provide an API key
- Focused outputs - stays grounded in your actual code changes
- Smart configurations - interactive presets or fully custom options

## 🚀 Quick Start
### Installation
```bash
npm install -g autocommit-cli
```
### Setup
```bash
autocommit --setup
```
### This will guide you through:
1. Choosing your AI provider (OpenAI GPT or Anthropic Claude)
2. Adding your API key to a new `.autocommitrc` in our project file (auto-added to `.gitignore`)
3. Setting preferences for model, temperature, and target branch

## Basic Usage

1. `cd` into your project directory.

2. Stage your changes as usual:
```bash
git add .
```

3. Generate commit message:
```bash
autocommit
```
4. Review and accept, edit, or retry the generated message in the interactive CLI

## 📖 Output Examples
```
### Default Commit Message (Preset)
🤖 ──────────────────────────────────────────────────────────── 🤖
Implement user authentication with OAuth2 integration

Add JWT-based authentication system using OAuth2 providers (Google, GitHub) 
with automatic token refresh and secure session management. The implementation 
includes comprehensive error handling and fallback to local authentication.

- Auth service: Implement OAuth2 flow with PKCE security
- User model: Add social login fields and session tracking  
- Frontend: Create login/logout components with loading states
- API: Add protected route middleware and token validation

Additional changes include database migration for user social accounts and 
updated API documentation with authentication examples.
🤖 ──────────────────────────────────────────────────────────── 🤖


(a)ccept / (e)dit / (r)etry / (q)uit:
```

### PR/MR Description Mode
```
**TITLE:** Implement comprehensive AutoCommit CLI tool with AI-powered Git workflows

**SUMMARY:** This changeset creates a complete CLI tool for generating intelligent 
commit messages using Claude or GPT models. The implementation provides developers 
with an interactive workflow for analyzing Git diffs and producing well-structured, 
technical commit messages that improve code documentation and team collaboration.

**CHANGES:**
- Core functionality: Main autocommit.mjs script with complete generate/review/edit workflow
- LLM integration: Support for both Claude and OpenAI APIs with configurable prompting
- Configuration system: Setup wizard and .autocommitrc template with API key management
- Interactive CLI: Modular components including animated loaders, ASCII art, and user prompts
- Git integration: Staged diff extraction and branch comparison capabilities

**NOTES FOR REVIEWERS:**
Pay attention to the readline singleton pattern for consistent input handling across 
components. Test the editor integration workflow and verify API key security in the 
.gitignore setup process.
```

## ⚙️ Configuration Options
AutoCommit offers several preset modes:

- Default - Balanced detail with technical focus and design rationale (15 bullet points max)
- Quick - Concise messages for rapid development (5 bullet points max)
- Detailed - Comprehensive explanations with narrative flow (30 bullet points max)
- Custom - Build your own configuration with specific preferences

### Interactive Configuration
When you run autocommit, you will be prompted to choose:

- Default settings (press Enter) or custom configuration (press 'c')

If you choose to configure: 

- Choose Commit message vs MR description mode
- Choose a Preset mode (quick, detailed, custom)

# 🔧 Advanced Usage
## Configuration File
The setup wizard creates `.autocommitrc` in your project directory:
```json
{
  "provider": "claude",
  "model": "claude-3-haiku-20240307", 
  "temperature": 0.3,
  "openaiApiKey": "sk-...",
  "claudeApiKey": "sk-ant-...",
  "targetBranch": "origin/main"
}
```
## Temperature Setting

The default temperature of 0.3 provides:

- Consistent format - follows instructions reliably
- Focused content - sticks to actual code changes
- Less hallucination - won't make up features not in the diff

## Command Line Options
```bash
autocommit --setup          # Run setup wizard
autocommit --help           # Show help information  
autocommit --version        # Show version
```

## Workflow Features

- Animated progress indicators - see exactly what the tool is doing
- Editor integration - opens nano for manual message editing
- Retry functionality - generate new versions until satisfied
- ASCII art borders - clearly distinguishes content from other terminal output
- Staged-only analysis - only analyzes git added changes

# 🎯 Why AutoCommit?

## Before AutoCommit

```bash
# 50 rows of this in Commits tab
fix stuff
update components  
minor changes
wip
```

## After AutoCommit

```
Refactor About Page layout and Photography Gallery with responsive grid

Restructures About Page with improved content organization and rebuilds Gallery 
with grid layout system. The changes enhance user experience through 
better content flow, responsive design patterns, and optimized image handling.

- About Page: Replace text-heavy layout with centered design and hero image
- Photography Gallery: Replace masonry with three-column responsive system  
- Navigation: Add click-outside handling and consistent dropdown positioning

Additional changes include blog layout migration to flexbox architecture and 
standardized footer implementations across all pages.
```

# 🛠️ Architecture

This is AutoCommit's "first stab" file structure.


```
autocommit/
├── autocommit.mjs              # Main entry point
├── llm-client.mjs              # AI provider integration
├── get-diff.mjs                # Git diff extraction
├── config.mjs                  # Configuration loading
├── setup.mjs                   # Interactive setup wizard
└── cli_interactions/           # Modular CLI components
    ├── ascii-art.mjs           # Terminal formatting
    ├── commit-config-builder.mjs # User preference handling
    ├── step-loader.mjs         # Animated progress indicators
    ├── question-helper.mjs     # Standardized user prompts
    ├── readline-singleton.mjs  # Consistent input handling
    ├── user-instructions.mjs   # Welcome banner and initial prompts
    └── constants.mjs           # Configuration presets
```

# 🤝 Contributing

I welcome contributions! Please see our Contributing Guide for details.

## Development Setup

```bash
git clone https://github.com/yourusername/autocommit-cli
cd autocommit-cli
npm install
```

## Local Development
```bash
# Link for local testing
npm link

# Use locally
autocommit
```

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

Built with OpenAI and Anthropic APIs
Inspired by the need for better commit message practices in software development
Thanks to all contributors and the open source community

# 🔗 Links

- [GitHub Repository](https://github.com/haejinjo/autocommit)
- [npm Package]()
- [Issues & Feature Requests](https://github.com/haejinjo/autocommit/issues)
- [Linkedin](https://www.linkedin.com/in/haejinjo/)
- [Website](https://www.hejinjo.com/)