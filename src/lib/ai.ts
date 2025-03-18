import OpenAI from 'openai';

// 一个简单的HTML到纯文本的转换函数
function htmlToText(html: string): string {
  // 移除HTML标签但保留文本内容
  let text = html.replace(/<[^>]*>/g, ' ');
  // 替换多个空格为单个空格
  text = text.replace(/\s+/g, ' ');
  // 替换HTML实体
  text = text.replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  
  return text.trim();
}

export async function analyzeDiary(content: string) {
  try {
    console.log('Client - 发送分析请求:', content.substring(0, 100) + '...');
    
    // 检查输入的内容是否包含HTML标签（客户端也做一次处理以减轻服务器负担）
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(content);
    
    // 如果是HTML，转换为纯文本
    const textContent = isHtml ? htmlToText(content) : content;
    
    // 调用API路由进行分析
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content }), // 仍然发送原始HTML内容，由服务端决定如何处理
    });

    if (!response.ok) {
      throw new Error(`Analysis failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Client - 收到分析结果:', data.analysis);
    return data.analysis;
  } catch (error) {
    console.error('Client - AI 分析失败:', error);
    return null;
  }
} 