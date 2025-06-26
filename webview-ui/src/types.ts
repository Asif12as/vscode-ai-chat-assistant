export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    attachedFiles?: AttachedFile[];
}

export interface AttachedFile {
    name: string;
    path: string;
    relativePath: string;
    type: 'file' | 'directory';
}

export interface FileContent {
    content: string;
    type: 'text' | 'binary' | 'image';
}