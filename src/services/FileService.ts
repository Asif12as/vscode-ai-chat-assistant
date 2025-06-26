import * as vscode from 'vscode';
import * as path from 'path';

export interface FileInfo {
    name: string;
    path: string;
    relativePath: string;
    type: 'file' | 'directory';
}

export interface FileContent {
    content: string;
    type: 'text' | 'binary' | 'image';
}

export class FileService {
    private readonly textFileExtensions = new Set([
        '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.hpp',
        '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.clj',
        '.hs', '.ml', '.fs', '.vb', '.pl', '.r', '.m', '.sh', '.bash', '.zsh',
        '.fish', '.ps1', '.bat', '.cmd', '.html', '.htm', '.xml', '.css', '.scss',
        '.sass', '.less', '.json', '.yaml', '.yml', '.toml', '.ini', '.cfg',
        '.conf', '.config', '.env', '.gitignore', '.gitattributes', '.md',
        '.markdown', '.rst', '.txt', '.log', '.sql', '.graphql', '.gql',
        '.dockerfile', '.makefile', '.cmake', '.gradle', '.pom', '.lock'
    ]);

    private readonly imageExtensions = new Set([
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico',
        '.tiff', '.tif', '.psd', '.ai', '.eps'
    ]);

    async searchFiles(query: string): Promise<FileInfo[]> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return [];
        }

        const files: FileInfo[] = [];
        const searchPattern = `**/*${query}*`;

        try {
            for (const folder of workspaceFolders) {
                const foundFiles = await vscode.workspace.findFiles(
                    new vscode.RelativePattern(folder, searchPattern),
                    '**/node_modules/**',
                    50 // Limit results
                );

                for (const fileUri of foundFiles) {
                    const relativePath = vscode.workspace.asRelativePath(fileUri);
                    const fileName = path.basename(fileUri.fsPath);
                    
                    files.push({
                        name: fileName,
                        path: fileUri.fsPath,
                        relativePath: relativePath,
                        type: 'file'
                    });
                }
            }

            // Sort by relevance (exact matches first, then by name)
            files.sort((a, b) => {
                const aExact = a.name.toLowerCase().includes(query.toLowerCase());
                const bExact = b.name.toLowerCase().includes(query.toLowerCase());
                
                if (aExact && !bExact) return -1;
                if (!aExact && bExact) return 1;
                
                return a.name.localeCompare(b.name);
            });

            return files.slice(0, 20); // Return top 20 results

        } catch (error) {
            console.error('Error searching files:', error);
            return [];
        }
    }

    async getFileContent(filePath: string): Promise<FileContent | null> {
        try {
            const uri = vscode.Uri.file(filePath);
            const stat = await vscode.workspace.fs.stat(uri);
            
            // Check if it's a file (not directory)
            if (stat.type !== vscode.FileType.File) {
                return null;
            }

            const ext = path.extname(filePath).toLowerCase();
            
            // Check file type
            if (this.textFileExtensions.has(ext) || this.isLikelyTextFile(filePath)) {
                const content = await vscode.workspace.fs.readFile(uri);
                const textContent = new TextDecoder('utf-8').decode(content);
                
                return {
                    content: textContent,
                    type: 'text'
                };
            } else if (this.imageExtensions.has(ext)) {
                // For images, return metadata instead of binary content
                const stats = await vscode.workspace.fs.stat(uri);
                return {
                    content: `Image file: ${path.basename(filePath)}\nSize: ${stats.size} bytes\nPath: ${filePath}`,
                    type: 'image'
                };
            } else {
                // Binary file
                return {
                    content: `Binary file: ${path.basename(filePath)}\nPath: ${filePath}`,
                    type: 'binary'
                };
            }

        } catch (error) {
            console.error('Error reading file:', error);
            return null;
        }
    }

    private isLikelyTextFile(filePath: string): boolean {
        const fileName = path.basename(filePath).toLowerCase();
        const textFileNames = [
            'readme', 'license', 'changelog', 'authors', 'contributors',
            'dockerfile', 'makefile', 'gemfile', 'rakefile', 'procfile'
        ];
        
        return textFileNames.some(name => fileName === name || fileName.startsWith(name + '.'));
    }
}