import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 将HTML内容转换为纯文本
export function htmlToText(html: string): string {
  if (!html) return '';
  
  // 使用一个临时的div来解析HTML
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

// 将Markdown转换为安全的HTML
export async function markdownToHtml(markdown: string): Promise<string> {
  if (!markdown) return '';
  
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(markdown);
    
  return result.toString();
}

// 提取标签工具函数
export function extractTags(text: string): string[] {
  const matches = text.match(/#[^\s#<>]+/g) || [];
  return matches.map(tag => tag.substring(1));
} 