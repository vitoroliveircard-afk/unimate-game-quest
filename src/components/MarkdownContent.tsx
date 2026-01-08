import { useMemo } from 'react';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const html = useMemo(() => {
    // Simple markdown parser
    let parsed = content;
    
    // Code blocks
    parsed = parsed.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre class="bg-muted/50 rounded-xl p-4 overflow-x-auto my-4 border border-white/10"><code class="text-sm font-mono text-primary">${escapeHtml(code.trim())}</code></pre>`;
    });
    
    // Inline code
    parsed = parsed.replace(/`([^`]+)`/g, '<code class="bg-muted/50 px-2 py-1 rounded text-primary text-sm font-mono">$1</code>');
    
    // Headers
    parsed = parsed.replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-6 mb-3 text-foreground">$1</h3>');
    parsed = parsed.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h2>');
    parsed = parsed.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-8 mb-4 text-foreground">$1</h1>');
    
    // Bold and italic
    parsed = parsed.replace(/\*\*\*(.+?)\*\*\*/g, '<strong class="italic text-foreground">$1</strong>');
    parsed = parsed.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>');
    parsed = parsed.replace(/\*(.+?)\*/g, '<em class="text-foreground">$1</em>');
    
    // Lists
    parsed = parsed.replace(/^\s*[-*]\s+(.*)$/gm, '<li class="ml-6 list-disc text-muted-foreground">$1</li>');
    parsed = parsed.replace(/(<li.*<\/li>\n?)+/g, '<ul class="my-4 space-y-2">$&</ul>');
    
    // Numbered lists
    parsed = parsed.replace(/^\s*\d+\.\s+(.*)$/gm, '<li class="ml-6 list-decimal text-muted-foreground">$1</li>');
    
    // Links
    parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:text-primary/80" target="_blank" rel="noopener">$1</a>');
    
    // Blockquotes
    parsed = parsed.replace(/^>\s+(.*)$/gm, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 text-muted-foreground italic">$1</blockquote>');
    
    // Paragraphs
    parsed = parsed.replace(/\n\n/g, '</p><p class="text-muted-foreground leading-relaxed mb-4">');
    parsed = '<p class="text-muted-foreground leading-relaxed mb-4">' + parsed + '</p>';
    
    // Clean up empty paragraphs
    parsed = parsed.replace(/<p[^>]*>\s*<\/p>/g, '');
    
    return parsed;
  }, [content]);

  return (
    <div 
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escapeHtml(text: string) {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
