import MarkdownRenderer from './MarkdownRenderer';

const sampleMarkdown = `# Welcome to Markdown Rendering

This is a **bold text** and this is *italic text*.

## Code Examples

Here's some inline code: \`const message = "Hello World";\`

And here's a code block:

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3

### Ordered List
1. First step
2. Second step
3. Third step

## Links and References

Visit [Google](https://google.com) for search.

## Blockquotes

> This is a blockquote. It can contain multiple lines and is styled differently from regular text.

## Tables

| Feature | Support | Notes |
|---------|---------|-------|
| Bold | ✅ | **text** |
| Italic | ✅ | *text* |
| Code | ✅ | \`code\` |
| Links | ✅ | [text](url) |

## Task Lists

- [x] Create markdown renderer
- [x] Add syntax highlighting
- [x] Style with Tailwind prose
- [ ] Add more features

---

*This markdown renderer supports GitHub Flavored Markdown (GFM) and is styled with Tailwind CSS prose classes.*`;

export default function MarkdownDemo() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Markdown Renderer Demo</h2>
      <div className="bg-card border border-border rounded-lg p-6">
        <MarkdownRenderer content={sampleMarkdown} />
      </div>
    </div>
  );
} 