export async function analyzeDiary(content: string) {
  try {
    console.log('Client - 发送分析请求:', content.substring(0, 100) + '...');
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
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