import React from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { Copy, User, Bot, Paperclip } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
    message: Message;
}

// Configure marked for syntax highlighting
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (err) {
                console.error('Highlight error:', err);
            }
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.sender === 'user';
    
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    const renderContent = () => {
        if (isUser) {
            return (
                <div className="message-text">
                    {message.content}
                </div>
            );
        } else {
            // For AI messages, render markdown
            const htmlContent = marked(message.content);
            return (
                <div 
                    className="message-text markdown-content"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            );
        }
    };

    const formatTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className={`message-bubble ${isUser ? 'user' : 'ai'} fade-in`}>
            <div className="message-header">
                <div className="message-avatar">
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className="message-info">
                    <span className="message-sender">
                        {isUser ? 'You' : 'AI Assistant'}
                    </span>
                    <span className="message-timestamp">
                        {formatTime(message.timestamp)}
                    </span>
                </div>
                {!isUser && (
                    <button
                        className="copy-button"
                        onClick={() => copyToClipboard(message.content)}
                        title="Copy message"
                    >
                        <Copy size={14} />
                    </button>
                )}
            </div>
            
            {renderContent()}
            
            {message.attachedFiles && message.attachedFiles.length > 0 && (
                <div className="attached-files">
                    <div className="attached-files-header">
                        <Paperclip size={14} />
                        <span>Attached files:</span>
                    </div>
                    <div className="attached-files-list">
                        {message.attachedFiles.map((file, index) => (
                            <div key={index} className="attached-file">
                                <span className="file-name">{file.name}</span>
                                <span className="file-path">{file.relativePath}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};