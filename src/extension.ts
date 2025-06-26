import * as vscode from 'vscode';
import { ChatViewProvider } from './providers/ChatViewProvider';

export function activate(context: vscode.ExtensionContext) {
    // Set context for when chat view is enabled
    vscode.commands.executeCommand('setContext', 'aiChatAssistant.chatViewEnabled', true);

    // Create chat view provider
    const chatProvider = new ChatViewProvider(context.extensionUri, context);

    // Register webview view provider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'aiChatAssistant.chatView',
            chatProvider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

    // Register commands
    const openChatCommand = vscode.commands.registerCommand('aiChatAssistant.openChat', () => {
        vscode.commands.executeCommand('workbench.view.extension.ai-chat-assistant');
    });

    context.subscriptions.push(openChatCommand);

    console.log('AI Chat Assistant extension is now active!');
}

export function deactivate() {}