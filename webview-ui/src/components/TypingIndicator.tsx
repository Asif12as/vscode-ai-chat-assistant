import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = () => {
    return (
        <div className="message-bubble ai typing-message fade-in">
            <div className="message-header">
                <div className="message-avatar">
                    <Bot size={16} />
                </div>
                <div className="message-info">
                    <span className="message-sender">AI Assistant</span>
                </div>
            </div>
            <div className="message-text">
                <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                </div>
            </div>
        </div>
    );
};