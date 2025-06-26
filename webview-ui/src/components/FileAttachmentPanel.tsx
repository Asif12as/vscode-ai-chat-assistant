import React, { useState, useEffect, useRef } from 'react';
import { Search, File, X } from 'lucide-react';
import { AttachedFile } from '../types';

interface FileAttachmentPanelProps {
    availableFiles: AttachedFile[];
    onFileSelect: (file: AttachedFile) => void;
    onSearch: (query: string) => void;
    onClose: () => void;
}

export const FileAttachmentPanel: React.FC<FileAttachmentPanelProps> = ({
    availableFiles,
    onFileSelect,
    onSearch,
    onClose
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Focus search input when panel opens
        searchInputRef.current?.focus();
    }, []);

    useEffect(() => {
        // Reset selected index when files change
        setSelectedIndex(0);
    }, [availableFiles]);

    useEffect(() => {
        // Handle keyboard navigation
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => 
                        prev < availableFiles.length - 1 ? prev + 1 : 0
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => 
                        prev > 0 ? prev - 1 : availableFiles.length - 1
                    );
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (availableFiles[selectedIndex]) {
                        onFileSelect(availableFiles[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [availableFiles, selectedIndex, onFileSelect, onClose]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch(query);
    };

    const handleFileClick = (file: AttachedFile) => {
        onFileSelect(file);
    };

    return (
        <div className="file-attachment-panel slide-up" ref={panelRef}>
            <div className="panel-header">
                <div className="search-container">
                    <Search size={16} className="search-icon" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
                <button onClick={onClose} className="close-button" title="Close">
                    <X size={16} />
                </button>
            </div>
            
            <div className="file-list">
                {availableFiles.length === 0 ? (
                    <div className="no-files">
                        {searchQuery ? 'No files found' : 'Start typing to search files...'}
                    </div>
                ) : (
                    availableFiles.map((file, index) => (
                        <div
                            key={file.path}
                            className={`file-item ${index === selectedIndex ? 'selected' : ''}`}
                            onClick={() => handleFileClick(file)}
                        >
                            <File size={16} className="file-icon" />
                            <div className="file-info">
                                <div className="file-name">{file.name}</div>
                                <div className="file-path">{file.relativePath}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};