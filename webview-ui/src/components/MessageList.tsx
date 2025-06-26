import React from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Message } from '../types';

interface MessageListProps {
    messages: Message[];
    isTyping: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isTyping }) => {
    return (
        <div className="message-list">
            {messages.length === 0 && (
                <div className="welcome-message">
                    <h3>Welcome to AI Chat Assistant!</h3>
                    <p>
                        Ask me anything about your code, attach files using @ syntax, 
                        or get help with development tasks.
                    </p>
                    <div className="welcome-tips">
                        <div className="tip">
                            <strong>💡 Tip:</strong> Type @ to search and attach workspace files
                        </div>
                        <div className="tip">
                            <strong>🔧 Tip:</strong> I can help with code review, debugging, and explanations
                        </div>
                    </div>
                </div>
            )}
            
            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}
            
            {isTyping && <TypingIndicator />}
        </div>
    );
};