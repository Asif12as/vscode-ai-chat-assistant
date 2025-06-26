import * as vscode from 'vscode';
import { ChatService } from '../services/ChatService';
import { FileService } from '../services/FileService';

export class ChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'aiChatAssistant.chatView';
    private _view?: vscode.WebviewView;
    private chatService: ChatService;
    private fileService: FileService;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _context: vscode.ExtensionContext
    ) {
        this.chatService = new ChatService();
        this.fileService = new FileService();
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        // Configure webview options
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview')
            ]
        };

        // Set initial HTML content
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(
            async (data) => {
                switch (data.type) {
                    case 'sendMessage':
                        await this.handleSendMessage(data.message, data.attachedFiles);
                        break;
                    case 'searchFiles':
                        await this.handleSearchFiles(data.query);
                        break;
                    case 'getFileContent':
                        await this.handleGetFileContent(data.filePath);
                        break;
                    case 'ready':
                        // Send initial data when webview is ready
                        this.sendMessage('initialized', {});
                        break;
                }
            },
            undefined,
            this._context.subscriptions
        );
    }

    private async handleSendMessage(message: string, attachedFiles: string[]) {
        try {
            // Show typing indicator
            this.sendMessage('typingStart', {});

            // Get file contents if files are attached
            const fileContents: Array<{ path: string; content: string; type: string }> = [];
            for (const filePath of attachedFiles) {
                const content = await this.fileService.getFileContent(filePath);
                if (content) {
                    fileContents.push({
                        path: filePath,
                        content: content.content,
                        type: content.type
                    });
                }
            }

            // Get AI response
            const response = await this.chatService.sendMessage(message, fileContents);

            // Hide typing indicator and send response
            this.sendMessage('typingEnd', {});
            this.sendMessage('aiResponse', {
                message: response,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            this.sendMessage('typingEnd', {});
            this.sendMessage('error', {
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    }

    private async handleSearchFiles(query: string) {
        try {
            const files = await this.fileService.searchFiles(query);
            this.sendMessage('filesFound', { files });
        } catch (error) {
            console.error('Error searching files:', error);
            this.sendMessage('filesFound', { files: [] });
        }
    }

    private async handleGetFileContent(filePath: string) {
        try {
            const content = await this.fileService.getFileContent(filePath);
            this.sendMessage('fileContent', {
                filePath,
                content: content?.content || '',
                type: content?.type || 'text'
            });
        } catch (error) {
            console.error('Error getting file content:', error);
            this.sendMessage('error', {
                message: `Failed to read file: ${filePath}`
            });
        }
    }

    private sendMessage(type: string, data: any) {
        if (this._view) {
            this._view.webview.postMessage({ type, ...data });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'assets', 'index.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview', 'assets', 'index.css')
        );

        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; connect-src https:;">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>AI Chat Assistant</title>
            </head>
            <body>
                <div id="root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}