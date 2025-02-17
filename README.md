# ETHOSLOG

ETHOSLOG 是一个智能日记应用，帮助用户记录日常思考并通过 AI 获得深度分析洞察。

## 功能特点

- 📝 Markdown 编辑器支持
- 🔒 用户认证和数据安全
- 🗑️ 软删除机制
- 🤖 AI 分析
  - 5W1H 结构化分析
  - 实时分析状态
  - 自动矛盾检测
- 📊 数据可视化（计划中）

## 技术栈

- **前端框架**: Next.js 14
- **UI 组件**: shadcn/ui
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **编辑器**: react-md-editor
- **AI 模型**: 阿里云百炼 deepseek-r1
- **部署**: Vercel

## 开始使用

1. 克隆项目
```bash
git clone https://github.com/your-username/ethoslog.git
cd ethoslog
```

2. 安装依赖
```bash
npm install
```

3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local 文件，填入你的配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DASHSCOPE_API_KEY=your_dashscope_api_key
```

4. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 数据库设置

1. 在 Supabase 中创建新项目
2. 执行 `sql/diaries.sql` 中的数据库初始化脚本
3. 配置 RLS (Row Level Security) 策略

## 部署

项目使用 Vercel 进行部署。点击下面的按钮一键部署：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ethoslog)

## 开发路线图

- [x] 基础日记功能
- [x] 用户认证
- [x] Markdown 支持
- [x] 软删除机制
- [x] AI 分析集成
  - [x] 5W1H 结构化分析
  - [x] 实时分析状态
  - [ ] 情感分析
  - [ ] 建议生成
- [ ] 数据导出
- [ ] 统计分析
- [ ] 移动端适配

## 贡献

欢迎提交 Pull Requests 和 Issues！

## 许可证

[MIT](LICENSE)
