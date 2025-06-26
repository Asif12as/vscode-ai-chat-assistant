# AI Chat Assistant - VS Code Extension

A comprehensive VS Code extension that integrates an AI-powered chat assistant directly into your development environment. Features include file attachment with `@` syntax, intelligent code generation, and a beautiful React-based chat interface.

## Features

🤖 **AI-Powered Chat**: Intelligent conversations with OpenAI GPT models  
📎 **File Attachments**: Use `@` syntax to attach workspace files for context  
💻 **Code Generation**: Generate, review, and explain code with AI assistance  
🎨 **Beautiful UI**: Modern React interface with VS Code native theming  
⚡ **Real-time**: Instant responses with typing indicators and smooth animations  
🔒 **Secure**: Safe API key management through VS Code settings  

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Open in VS Code and press `F5` to launch Extension Development Host
5. Configure your OpenAI API key in VS Code settings

## Configuration

Go to VS Code Settings and configure:

- `aiChatAssistant.openaiApiKey`: Your OpenAI API key
- `aiChatAssistant.model`: AI model to use (gpt-4, gpt-4-turbo, gpt-3.5-turbo)
- `aiChatAssistant.maxTokens`: Maximum tokens for responses

## Usage

1. **Open Chat**: Click the AI Chat Assistant icon in the Activity Bar or use the command palette
2. **Attach Files**: Type `@` followed by filename to search and attach workspace files
3. **Ask Questions**: Get help with coding, debugging, code review, and explanations
4. **Copy Responses**: Click the copy button on AI messages to copy content

## File Attachment

- Type `@filename` to search for files in your workspace
- Use arrow keys to navigate the file list
- Press Enter or click to attach files
- Attached files provide context for better AI responses

## Development

### Project Structure

```
├── src/
│   ├── extension.ts              # Extension entry point
│   ├── providers/
│   │   └── ChatViewProvider.ts   # WebView provider
│   └── services/
│       ├── ChatService.ts        # AI integration
│       └── FileService.ts        # File operations
├── webview-ui/
│   ├── tsconfig.json            # TypeScript config for React
│   ├── tsconfig.node.json       # TypeScript config for Node
│   └── src/
│       ├── components/           # React components
│       ├── styles/              # CSS styles
│       └── types.ts             # TypeScript types
└── package.json                 # Extension manifest
```

### Debugging the Extension

To debug the extension:

1. Ensure you've run `npm run compile` and `npm run build:webview` to build both the extension and UI
2. Press `F5` in VS Code to launch the Extension Development Host
3. In the Extension Development Host window, open the Command Palette (`Ctrl+Shift+P`)
4. Run the command "Open AI Chat" to launch the extension
5. Set breakpoints in your TypeScript files to debug the extension code

If you encounter issues when pressing F5:
- Make sure the `.vscode/launch.json` and `.vscode/tasks.json` files are properly configured
- Check that all dependencies are installed with `npm install`
- Verify that the extension has been compiled with `npm run compile`
- If you see React syntax errors, ensure the webview-ui has proper TypeScript configuration files (tsconfig.json and tsconfig.node.json)

### Build Commands

- `npm run compile`: Build the extension
- `npm run watch`: Watch for changes
- `npm run build:webview`: Build React UI
- `npm run dev:webview`: Watch React UI changes

### WebView Communication

The extension uses VS Code's WebView API for communication between the extension host and React UI:

- Extension → WebView: `webview.postMessage()`
- WebView → Extension: `vscode.postMessage()`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Requirements

- VS Code 1.74.0 or higher
- Node.js 18+ for development
- OpenAI API key for AI functionality

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please open an issue on GitHub.