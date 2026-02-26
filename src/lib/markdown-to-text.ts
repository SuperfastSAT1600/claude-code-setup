/**
 * Convert markdown to plain text for Naver platform
 * Preserves: paragraph spacing, emojis, list structure
 * Removes: markdown syntax (**, ##, [], etc.)
 */
export function markdownToPlainText(markdown: string): string {
  let text = markdown;

  // Remove code blocks (```...```)
  text = text.replace(/```[\s\S]*?```/g, '');

  // Remove inline code (`...`)
  text = text.replace(/`([^`]+)`/g, '$1');

  // Convert links [text](url) to just text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove bold/italic (**, *, __, _)
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');

  // Convert headers (## Text) to plain text with spacing
  text = text.replace(/^#{1,6}\s+(.*)$/gm, '\n$1\n');

  // Convert unordered lists (- item, * item) to simple dashes
  text = text.replace(/^[*-]\s+/gm, '- ');

  // Clean up excessive blank lines (max 2 consecutive)
  text = text.replace(/\n{3,}/g, '\n\n');

  // Trim whitespace
  return text.trim();
}
