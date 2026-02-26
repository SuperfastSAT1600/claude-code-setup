import { marked } from 'marked';

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Convert markdown to HTML with proper document structure
 * @param markdown - The markdown content to convert
 * @param title - The document title for the HTML head
 * @returns Complete HTML document as a string
 */
export function markdownToHTML(markdown: string, title: string): string {
  // Configure marked options for better output
  marked.setOptions({
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert \n to <br>
  });

  // Convert markdown to HTML body
  const htmlBody = marked.parse(markdown) as string;

  // Wrap in full HTML document with styling
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #fff;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; }
    p { margin-top: 0; margin-bottom: 1em; }
    code {
      background: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 85%;
    }
    pre {
      background: #f6f8fa;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
      line-height: 1.45;
    }
    pre code {
      background: none;
      padding: 0;
      font-size: 100%;
    }
    blockquote {
      border-left: 4px solid #dfe2e5;
      padding-left: 1em;
      margin-left: 0;
      color: #6a737d;
    }
    ul, ol {
      padding-left: 2em;
      margin-top: 0;
      margin-bottom: 1em;
    }
    li + li {
      margin-top: 0.25em;
    }
    a {
      color: #0366d6;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 1em;
    }
    table th, table td {
      border: 1px solid #dfe2e5;
      padding: 0.6em 1em;
    }
    table th {
      background-color: #f6f8fa;
      font-weight: 600;
    }
    hr {
      border: none;
      border-top: 1px solid #eaecef;
      margin: 1.5em 0;
    }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;
}
