# Offer Go

你的专属 AI 求职助手。

Offer Go 是一个面向应届生和职场新人的智能简历编辑器。它围绕“导入简历、检查解析结果、JD 匹配诊断、AI 优化、画布精调、导出投递版本”搭建主流程，帮助用户把原始简历优化成更贴近目标岗位的中文求职简历。

## 核心功能

- **可编辑简历画布**：首页以 A4 简历画布为中心，支持双击内容块直接编辑。
- **简历导入**：支持 PDF、DOCX、TXT 导入，并在导入后进入质量检查步骤。
- **导入质量检查**：个人信息、教育经历、工作/实习经历、项目经历、技能证书均可在确认前修正。
- **JD 匹配诊断**：独立诊断页展示候选人画像、四维评分、简历亮点、Gap 分析、架构建议和 ATS 关键词。
- **AI 简历优化结果**：基于 JD 匹配报告生成完整 Markdown 简历，再写回首页结构化简历画布。
- **安全 AI 约束**：AI 只在用户原文基础上优化表达，不虚构公司、学校、项目、奖项、证书或具体数据。
- **版本管理**：用户手动保存版本，可重命名、恢复、删除历史版本。
- **双导出方式**：
  - 导出 PDF（推荐）：使用浏览器原生 `window.print()`，适合正式投递。
  - 导出图片版 PDF（备用）：截取简历画布生成图片型 PDF，用于浏览器打印兼容问题时备用。
- **本地保存**：简历数据、版本、诊断结果和优化结果保存在浏览器 `localStorage`，MVP 不需要登录或数据库。

## 技术栈

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- lucide-react
- mammoth
- pdf-parse
- pdf-lib
- modern-screenshot

## 项目结构

```text
src/
  app/
    api/
      ai/
        analyze-resume/
        diagnose-jd/
        generate-suggestions/
        optimize-resume/
        optimize-section/
        status/
      import-resume/
    jd-match/
    optimization-result/
  components/
    workbench/
      ResumeCanvas.tsx
      AiWorkbench.tsx
      ImportQualityReview.tsx
      TopToolbar.tsx
      VersionMenu.tsx
    ResumeApp.tsx
    JdMatchPage.tsx
    OptimizationResultPage.tsx
  lib/
    ai/
      prompts/
        jd-match.ts
        resume-optimization.ts
    ai-server.ts
    resume.ts
    types.ts
    workflow-storage.ts
```

## 本地启动

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

访问：

```text
http://127.0.0.1:3000
```

Windows 下也可以双击：

```text
start-dev.bat
```

## AI 配置

API Key 只能放在服务端环境变量里，不要写入前端代码，也不要提交到 Git。

复制环境变量模板：

```bash
copy .env.local.example .env.local
```

编辑 `.env.local`：

```bash
AI_API_FORMAT=openai-compatible
AI_API_BASE_URL=https://api.openai.com/v1
AI_API_KEY=your_api_key_here
AI_API_MODEL=gpt-4o-mini
AI_API_TIMEOUT_MS=60000
AI_USE_MOCK=false
```

如果你的模型服务兼容 OpenAI Chat Completions，服务端会请求：

```text
{AI_API_BASE_URL}/chat/completions
```

如果需要自定义 API 格式，可以设置：

```bash
AI_API_FORMAT=custom
```

## AI Prompt

后台 Prompt 独立维护，避免散落在组件中：

- `src/lib/ai/prompts/jd-match.ts`：JD 匹配诊断 Prompt。
- `src/lib/ai/prompts/resume-optimization.ts`：基于 JD 诊断报告生成完整优化简历的 Prompt。

当前优化约束：

- 不新增原简历没有的模块。
- 不删除原简历已有模块。
- 不修改姓名、学校、公司、项目名称、时间等事实字段。
- 不编造具体数字或百分比。
- 不把“参与/协助”夸大为“主导/负责”。
- 缺少真实量化结果时，只提示用户补充，不自动编造。

## 导出说明

### 导出 PDF（推荐）

使用浏览器原生打印：

```ts
window.print();
```

特点：

- 文字清晰，可复制。
- 只打印 `#resume-print-area` 简历画布。
- 导航、按钮、AI 面板、编辑器和 toast 不会进入 PDF。

如果浏览器打印时出现页眉、页脚、URL 或页码，请在打印设置中关闭“页眉和页脚”。

### 导出图片版 PDF（备用）

当浏览器原生打印的分页或排版不符合预期时，可以使用备用导出：

- 只截取 `#resume-print-area`。
- 截图前等待字体加载完成。
- 使用高分辨率截图。
- 超过一页时按 A4 分页切片，不强行压缩成一页。

图片版 PDF 本质是图片，不适合需要复制文字或 ATS 解析的正式投递场景。

## 常用命令

```bash
npm run lint
npm run typecheck
npm run build
```

## Git 注意事项

仓库已配置 `.gitignore`，默认排除：

- `node_modules/`
- `.next/`
- `.npm-cache/`
- `.tmp/`
- `.env` 和 `.env.*`
- 日志文件
- 构建产物和缓存

可以提交 `.env.local.example`，但不要提交 `.env.local` 或任何真实 API Key。

## MVP 范围

当前版本不包含：

- 登录注册
- 数据库
- 多用户账号
- 多份在线简历管理
- 模板市场
- 中英文切换
- 在线支付

这些能力可以在后续版本中继续扩展。
