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
          content: `分析复盘内容，按步骤执行以下指令：
任务一：
使用5W1H模型分析用户 在哪里，扮演什么角色，在做什么的时候，表现出了怎样的特质或价值观，做了什么具体的事情，表现出了什么特质或价值观，以及会这样做表现出了用户怎样的行为逻辑和信念这样的一句话个人宪法。

任务二：
根据ABC模型：分析触发事件、信念与结果的关系，分析复盘内容中的隐藏模式。

任务三：
根据阿德勒积极心理学的相关知识生成个性化的行动建议。

注意：
- 识别其中的矛盾项，根据复盘内容判断其倾向，保留更可靠的那一条。
- 输出特质时，如果能够分析完全的5W1H 6个元素，就完全输出，如果只能分析出其中几个元素，也可以组成一句话输出，如果一个元素都没有，直接输出"无"。原则是不要编造。要保持完整的一句话，不要使用（What）的形式对元素进行标注；
- 输出模式时，不要使用A、B、C或事件、信念之类的进行标注；
- 输出建议时使用通俗易懂的语言，要聚焦在立马可执行的最小化行动；
- 最终的输出结果为选取好的无序表格，不要有多余的空格，没有其他信息。
- 注意输出的逻辑，要求语言简洁，易于理解，不超过60个字。输出结果如：
- 个人特质：个人宪法
- 模式识别：隐藏模式
- 行动建议：行动建议

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