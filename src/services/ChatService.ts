import * as vscode from 'vscode';
import OpenAI from 'openai';

interface FileContent {
    path: string;
    content: string;
    type: string;
}

export class ChatService {
    private openai: OpenAI | null = null;
    private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    constructor() {
        this.initializeOpenAI();
    }

    private initializeOpenAI() {
        const config = vscode.workspace.getConfiguration('aiChatAssistant');
        const apiKey = config.get<string>('openaiApiKey');

        if (apiKey) {
            this.openai = new OpenAI({
                apiKey: apiKey
            });
        }
    }

    async sendMessage(message: string, attachedFiles: FileContent[] = []): Promise<string> {
        if (!this.openai) {
            throw new Error('OpenAI API key not configured. Please set it in VS Code settings.');
        }

        try {
            // Build the message with file context
            let fullMessage = message;
            
            if (attachedFiles.length > 0) {
                fullMessage += '\n\nAttached files for context:\n';
                for (const file of attachedFiles) {
                    fullMessage += `\n--- ${file.path} ---\n`;
                    if (file.type === 'text') {
                        fullMessage += file.content;
                    } else {
                        fullMessage += `[${file.type.toUpperCase()} FILE - Content not displayed]`;
                    }
                    fullMessage += '\n';
                }
            }

            // Add system message for context
            const systemMessage = {
                role: 'system' as const,
                content: `You are an AI assistant integrated into VS Code. Help the user with coding tasks, code review, explanations, and general development questions. When files are attached, use their content as context for your responses. Provide clear, concise, and actionable advice. Format code responses with proper syntax highlighting using markdown code blocks with language specification.`
            };

            // Get configuration
            const config = vscode.workspace.getConfiguration('aiChatAssistant');
            const model = config.get<string>('model') || 'gpt-4';
            const maxTokens = config.get<number>('maxTokens') || 2048;

            // Prepare messages array
            const messages = [
                systemMessage,
                ...this.conversationHistory,
                { role: 'user' as const, content: fullMessage }
            ];

            // Call OpenAI API
            const completion = await this.openai.chat.completions.create({
                model: model,
                messages: messages,
                max_tokens: maxTokens,
                temperature: 0.7
            });

            const response = completion.choices[0]?.message?.content || 'No response generated.';

            // Update conversation history
            this.conversationHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: response }
            );

            // Keep conversation history manageable (last 20 messages)
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            return response;

        } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('API key')) {
                    throw new Error('Invalid OpenAI API key. Please check your configuration.');
                } else if (error.message.includes('quota')) {
                    throw new Error('OpenAI API quota exceeded. Please check your usage.');
                } else if (error.message.includes('rate limit')) {
                    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                }
                throw error;
            }
            throw new Error('Failed to get AI response. Please try again.');
        }
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}