import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { AttachedFile } from '../types';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    attachedFiles: AttachedFile[];
    onFileDetach: (filePath: string) => void;
    onShowFilePanel: () => void;
    onFileSearch: (query: string) => void;
    disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    attachedFiles,
    onFileDetach,
    onShowFilePanel,
    onFileSearch,
    disabled = false
}) => {
    const [message, setMessage] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
        }
    }, [message]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const position = e.target.selectionStart;
        
        setMessage(value);
        setCursorPosition(position);

        // Check for @ symbol to trigger file search
        const beforeCursor = value.substring(0, position);
        const atIndex = beforeCursor.lastIndexOf('@');
        
        if (atIndex !== -1) {
            const afterAt = beforeCursor.substring(atIndex + 1);
            if (!afterAt.includes(' ') && afterAt.length >= 0) {
                onFileSearch(afterAt);
                if (afterAt.length === 0) {
                    onShowFilePanel();
                }
            }
        }
    };

    return (
        <div className="message-input-container">
            {attachedFiles.length > 0 && (
                <div className="attached-files-preview">
                    {attachedFiles.map((file) => (
                        <div key={file.path} className="attached-file-chip">
                            <Paperclip size={12} />
                            <span className="file-name">{file.name}</span>
                            <button
                                onClick={() => onFileDetach(file.path)}
                                className="detach-button"
                                title="Remove file"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="message-form">
                <div className="input-wrapper">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type @ to attach files, then ask your question..."
                        className="message-textarea"
                        rows={1}
                        disabled={disabled}
                    />
                    <div className="input-actions">
                        <button
                            type="button"
                            onClick={onShowFilePanel}
                            className="attach-button"
                            title="Attach file"
                            disabled={disabled}
                        >
                            <Paperclip size={16} />
                        </button>
                        <button
                            type="submit"
                            className="send-button"
                            disabled={!message.trim() || disabled}
                            title="Send message"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};