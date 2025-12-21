/**
 * Text utilities for content normalization.
 */

/**
 * Normalize whitespace in text content.
 * - Trims leading/trailing whitespace
 * - Collapses multiple blank lines to single blank line
 * - Trims each line individually
 * - Collapses multiple spaces to single space
 */
export function normalizeContent(content: string): string {
  return content
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')  // Collapse 3+ newlines to 2
    .replace(/[ \t]+/g, ' ')     // Collapse multiple spaces
    .trim();
}
