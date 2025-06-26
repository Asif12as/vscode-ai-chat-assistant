import React, { useState, useEffect, useRef } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { FileAttachmentPanel } from './FileAttachmentPanel';
import { Message, AttachedFile } from '../types';

// VS Code API type
declare const acquireVsCodeApi: () => {
    postMessage: (message: any) => void;
    getState: () => any;
    setState: (state: any) => void;
};

const vscode = acquireVsCodeApi();

export const ChatApp: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
    const [availableFiles, setAvailableFiles] = useState<AttachedFile[]>([]);
    const [showFilePanel, setShowFilePanel] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Handle messages from extension
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            
            switch (message.type) {
                case 'initialized':
                    console.log('Chat initialized');
                    break;
                    
                case 'aiResponse':
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        content: message.message,
                        sender: 'ai',
                        timestamp: new Date(message.timestamp)
                    }]);
                    setIsTyping(false);
                    break;
                    
                case 'typingStart':
                    setIsTyping(true);
                    break;
                    
                case 'typingEnd':
                    setIsTyping(false);
                    break;
                    
                case 'filesFound':
                    setAvailableFiles(message.files.map((file: any) => ({
                        name: file.name,
                        path: file.path,
                        relativePath: file.relativePath,
                        type: file.type
                    })));
                    break;
                    
                case 'error':
                    setError(message.message);
                    setIsTyping(false);
                    setTimeout(() => setError(null), 5000);
                    break;
                    
                default:
                    console.log('Unknown message type:', message.type);
            }
        };

        window.addEventListener('message', handleMessage);
        
        // Notify extension that webview is ready
        vscode.postMessage({ type: 'ready' });

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = (content: string) => {
        if (!content.trim()) return;

        // Add user message to chat
        const userMessage: Message = {
            id: Date.now().toString(),
            content,
            sender: 'user',
            timestamp: new Date(),
            attachedFiles: attachedFiles.length > 0 ? [...attachedFiles] : undefined
        };

        setMessages(prev => [...prev, userMessage]);
        
        // Send message to extension
        vscode.postMessage({
            type: 'sendMessage',
            message: content,
            attachedFiles: attachedFiles.map(f => f.path)
        });

        // Clear attached files
        setAttachedFiles([]);
        setError(null);
    };

    const handleFileSearch = (query: string) => {
        if (query.trim()) {
            vscode.postMessage({
                type: 'searchFiles',
                query: query.trim()
            });
        } else {
            setAvailableFiles([]);
        }
    };

    const handleFileAttach = (file: AttachedFile) => {
        if (!attachedFiles.some(f => f.path === file.path)) {
            setAttachedFiles(prev => [...prev, file]);
        }
        setShowFilePanel(false);
    };

    const handleFileDetach = (filePath: string) => {
        setAttachedFiles(prev => prev.filter(f => f.path !== filePath));
    };

    return (
        <div className="chat-app">
            <div className="chat-header">
                <h2>AI Chat Assistant</h2>
                {error && (
                    <div className="error-banner">
                        {error}
                    </div>
                )}
            </div>
            
            <div className="chat-messages">
                <MessageList 
                    messages={messages} 
                    isTyping={isTyping}
                />
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                {showFilePanel && (
                    <FileAttachmentPanel
                        availableFiles={availableFiles}
                        onFileSelect={handleFileAttach}
                        onSearch={handleFileSearch}
                        onClose={() => setShowFilePanel(false)}
                    />
                )}
                
                <MessageInput
                    onSendMessage={handleSendMessage}
                    attachedFiles={attachedFiles}
                    onFileDetach={handleFileDetach}
                    onShowFilePanel={() => setShowFilePanel(true)}
                    onFileSearch={handleFileSearch}
                    disabled={isTyping}
                />
            </div>
        </div>
    );
};