import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});

// HTML到纯文本的转换函数
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

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    console.log('API Route - 收到分析请求:', content.substring(0, 100) + '...');

    // 检查输入的内容是否包含HTML标签
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(content);
    
    // 如果是HTML，转换为纯文本用于分析
    const textContent = isHtml ? htmlToText(content) : content;

    const completion = await openai.chat.completions.create({
      model: "deepseek-r1",
      messages: [
        {
          role: "user",
          content: `按步骤执行以下指令：
1. 分析这篇复盘，使用5W1H的结构总结成这样的个人宪法"在家中（Where）陪伴父母时（When），我不是一个扫兴的（How）女儿（Who），我会耐心听他们表达（What），因为我希望让他们感受到被理解和关心（Why）"。核心逻辑是，从复盘中提取用户在哪里，扮演什么角色，在做什么的时候，表现出了怎样的特质或价值观，做了什么具体的事情表现出了该特质或价值观，以及会这样做表现出了用户怎样的行为逻辑和信念（即用户为什么会这么做）。
2. 识别其中的矛盾项，根据复盘内容判断其倾向，保留更可靠的那一条。
3. 注意：没有的信息不要胡编乱造。5W1H的6个元素，如果日记内容中有，就分析出来。如果一个元素都没有，直接输出"无"。如果有相关元素，但不足6个元素，就按已有的元素整合成一句话进行输出。以符合日记内容为主。
最终的输出结果为选取好的无序表格，没有其他信息。注意输出的逻辑，要求语言简洁，易于理解，不超过60个字。请严格按照这种格式输出，不要有其他内容：
- 在家中陪伴父母时，我不是一个扫兴的女儿，我会耐心听他们表达，因为我希望让他们感受到被理解和关心。

以下是需要分析的内容：
${textContent}`
        }
      ]
    });

    const analysis = completion.choices[0].message.content;
    console.log('API Route - AI 分析结果:', analysis);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('API Route - AI 分析失败:', error);
    return NextResponse.json(
      { error: 'Analysis failed' }, 
      { status: 500 }
    );
  }
} 