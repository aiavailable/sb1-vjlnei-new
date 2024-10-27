class CodeAnalyzer {
  constructor() {
    this.maxTokens = 199999;
    this.avgCharsPerToken = 4; // Approximate average characters per token
    this.fileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.py', '.java', '.cpp', '.cs', '.php', '.rb'];
  }

  async analyzeCurrent() {
    try {
      const files = await this.getAllFiles();
      if (!files || files.length === 0) return null;

      return this.analyzeFiles(files);
    } catch (error) {
      console.error('Error analyzing code:', error);
      return null;
    }
  }

  async getAllFiles() {
    const files = [];
    
    // Get all file elements from the file tree
    const fileElements = document.querySelectorAll('.file-tree-item');
    
    for (const elem of fileElements) {
      const fileName = elem.textContent.trim();
      if (this.isCodeFile(fileName)) {
        const content = await this.getFileContent(elem);
        if (content) {
          files.push({ name: fileName, content });
        }
      }
    }

    return files;
  }

  isCodeFile(fileName) {
    return this.fileExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  }

  async getFileContent(fileElement) {
    try {
      // Click the file to open it
      fileElement.click();
      
      // Wait for editor content to load
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get content from editor
      const content = this.getEditorContent();
      return content;
    } catch (error) {
      console.error('Error getting file content:', error);
      return null;
    }
  }

  getEditorContent() {
    try {
      // Method 1: Get from text area or pre element
      const codeElement = document.querySelector('.editor-container textarea, .editor-container pre');
      if (codeElement) return codeElement.value || codeElement.textContent;

      // Method 2: Get from Monaco editor lines
      const lines = document.querySelectorAll('.view-line');
      if (lines.length) {
        return Array.from(lines)
          .map(line => line.textContent)
          .join('\n');
      }

      // Method 3: Get from visible content
      const editorContent = document.querySelector('.monaco-editor-background + div');
      if (editorContent) return editorContent.textContent;

      return '';
    } catch (error) {
      console.error('Error getting editor content:', error);
      return '';
    }
  }

  analyzeFiles(files) {
    let totalTokens = 0;
    const largeFiles = [];

    files.forEach(file => {
      const estimatedTokens = Math.ceil(file.content.length / this.avgCharsPerToken);
      totalTokens += estimatedTokens;

      if (estimatedTokens > this.maxTokens) {
        largeFiles.push({
          name: file.name,
          estimatedTokens,
          size: file.content.length
        });
      }
    });

    return {
      totalFiles: files.length,
      totalTokens,
      exceedsLimit: totalTokens > this.maxTokens,
      largeFiles,
      tokenLimit: this.maxTokens
    };
  }
}

window.codeAnalyzer = new CodeAnalyzer();