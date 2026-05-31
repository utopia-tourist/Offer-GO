import type {
  AiSuggestion,
  AiSuggestionType,
  AnalyzeResumeResult,
  DiagnoseResult,
  GenerateSuggestionsRequest,
  JdMatchReport,
  OptimizeResumeResult,
  OptimizeResumeRequest,
  OptimizeSectionRequest,
  OptimizeSectionResult,
  ResumeData
} from "@/lib/types";
import {
  blockIdForPath,
  computeResumeHealthReport,
  getResumeValueByPath,
  resumeToCanvasBlocks,
  resumeToPlainText
} from "@/lib/resume";
import { buildJdMatchPrompt } from "@/lib/ai/prompts/jd-match";
import { buildResumeOptimizationPrompt } from "@/lib/ai/prompts/resume-optimization";

type AiTask = "optimize-section" | "optimize-resume" | "diagnose-jd" | "analyze-resume" | "generate-suggestions";
type AiProviderFormat = "openai-compatible" | "custom";

const systemPolicy =
  "你是专业简历顾问。只优化表达，不虚构公司、项目、数据、证书或奖项。若原文缺少结果指标，只提示用户补充，不能编造。输出必须是可解析 JSON。";

const defaultModel = "gpt-4o-mini";
const defaultTimeoutMs = 60000;

const safeArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) return value.split(/[，,；;\n]/).map((item) => item.trim()).filter(Boolean);
  return [];
};

const richTextArray = (value: unknown, fields: string[]) => {
  if (!Array.isArray(value)) return safeArray(value);

  return value
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (!item || typeof item !== "object") return "";
      const record = item as Record<string, unknown>;
      return fields
        .map((field) => record[field])
        .filter((fieldValue) => typeof fieldValue === "string" && fieldValue.trim())
        .join("；");
    })
    .filter(Boolean);
};

const pickText = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (!payload || typeof payload !== "object") return "";

  const record = payload as Record<string, unknown>;
  const candidates = [
    record.optimizedText,
    record.text,
    record.content,
    record.result,
    record.output,
    record.message
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }

  if (Array.isArray(record.choices)) {
    const first = record.choices[0] as Record<string, unknown> | undefined;
    const message = first?.message as Record<string, unknown> | undefined;
    if (typeof message?.content === "string") return message.content;
  }

  return "";
};

const randomId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
};

const parseJsonFromText = (text: string): Record<string, unknown> | null => {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const getAiConfig = () => {
  const baseUrl = process.env.AI_API_BASE_URL?.trim();
  const apiKey = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_API_MODEL?.trim() || defaultModel;
  const format = (process.env.AI_API_FORMAT?.trim() || "openai-compatible") as AiProviderFormat;
  const timeoutMs = Number(process.env.AI_API_TIMEOUT_MS ?? defaultTimeoutMs);
  const useMock = process.env.AI_USE_MOCK === "true";

  return {
    baseUrl,
    apiKey,
    model,
    format,
    timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : defaultTimeoutMs,
    useMock
  };
};

export const getAiStatus = () => {
  const config = getAiConfig();

  return {
    configured: Boolean(config.baseUrl && config.apiKey),
    mockEnabled: config.useMock,
    format: config.format,
    model: config.model,
    baseUrlConfigured: Boolean(config.baseUrl),
    apiKeyConfigured: Boolean(config.apiKey)
  };
};

const normalizeOpenAiUrl = (baseUrl: string) => {
  const trimmed = baseUrl.replace(/\/$/, "");
  if (trimmed.endsWith("/chat/completions")) return trimmed;
  if (trimmed.endsWith("/v1")) return `${trimmed}/chat/completions`;
  return `${trimmed}/v1/chat/completions`;
};

const withTimeout = (timeoutMs: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, timeout };
};

const buildPrompt = (task: AiTask, input: unknown) => {
  const json = JSON.stringify(input, null, 2);

  if (task === "optimize-section") {
    return [
      "请优化单个简历模块，输出 JSON：",
      '{"optimizedText":"优化后的简历表述","explanation":"为什么这样优化，以及需要用户补充的真实信息"}',
      "要求：突出动作、方法、结果和岗位相关性；不得编造任何事实。",
      `输入：${json}`
    ].join("\n\n");
  }

  if (task === "optimize-resume") {
    const data = input as OptimizeResumeRequest;
    return buildResumeOptimizationPrompt({
      resume: data.resume,
      jobDescription: data.jobDescription || data.targetJob || "",
      jdMatchReport: data.jdMatchReport
    });
  }

  if (task === "diagnose-jd") {
    const data = input as { resume?: ResumeData; jobDescription?: string };
    if (data.resume && data.jobDescription) return buildJdMatchPrompt({ resume: data.resume, jobDescription: data.jobDescription });
  }

  if (task === "analyze-resume" || task === "generate-suggestions") {
    return [
      "请扮演简历诊断顾问，输出严格 JSON，禁止自动覆盖简历。所有修改必须作为建议卡片等待用户确认。",
      "输出格式：",
      '{"healthReport":{"completenessScore":0,"professionalScore":0,"quantificationScore":0,"jdMatchScore":0,"majorIssues":["问题"],"prioritySections":["模块"]},"suggestions":[{"type":"expression","targetPath":"experiences.0.responsibilities","locationLabel":"工作经历 > 第1条","originalText":"原文","suggestedText":"建议改写","reason":"原因","risk":"风险提示"}]}',
      "type 只能是 expression、jd_keyword、quantification、structure。",
      "targetPath 必须来自输入 canvasBlocks 中的 path。",
      "不得虚构学校、公司、项目、奖项或数字指标；缺少量化数据时，risk 必须提示用户补充真实数据。",
      `输入：${json}`
    ].join("\n\n");
  }

  return [
    "请输出严格 JSON。",
    `输入：${json}`
  ].join("\n\n");
};

const requestExternalAi = async (task: AiTask, input: unknown) => {
  const config = getAiConfig();

  if (!config.baseUrl || !config.apiKey) {
    if (config.useMock) return null;
    throw new Error("AI 尚未配置：请在服务端 .env.local 设置 AI_API_BASE_URL 和 AI_API_KEY，然后重启开发服务。");
  }

  const { controller, timeout } = withTimeout(config.timeoutMs);
  const isOpenAiCompatible = config.format !== "custom";
  const prompt = buildPrompt(task, input);
  const url = isOpenAiCompatible ? normalizeOpenAiUrl(config.baseUrl) : config.baseUrl;
  const expectsJson = task !== "optimize-resume";
  const body = isOpenAiCompatible
    ? {
        model: config.model,
        temperature: 0.2,
        ...(expectsJson ? { response_format: { type: "json_object" } } : {}),
        messages: [
          {
            role: "system",
            content: expectsJson
              ? systemPolicy
              : "你是专业中文简历重构顾问。只输出可直接展示的 Markdown 简历正文，不输出 JSON、代码块或解释性前后缀。严禁虚构事实和数字。"
          },
          { role: "user", content: prompt }
        ]
      }
    : {
        task,
        model: config.model,
        system: systemPolicy,
        input
      };

  try {
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`AI API 请求失败：${response.status} ${message.slice(0, 240)}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
};

export const optimizeSection = async (request: OptimizeSectionRequest): Promise<OptimizeSectionResult> => {
  const payload = await requestExternalAi("optimize-section", request);
  if (payload) {
    const parsed = parseJsonFromText(pickText(payload)) ?? payload;
    const record = parsed as Record<string, unknown>;
    return {
      optimizedText: String(record.optimizedText ?? record.text ?? pickText(payload) ?? request.content),
      explanation: String(record.explanation ?? record.reason ?? "已根据简历表达结构优化措辞。")
    };
  }

  return {
    optimizedText: request.content
      ? `优化建议稿：${request.content.trim()}\n\n建议补充动作、方法与可验证结果，例如使用“负责/搭建/分析/协同”等动作词，并加入真实数据指标。`
      : "请先填写该模块内容，再进行 AI 优化。",
    explanation: "当前未配置 AI_API_BASE_URL，已返回本地 mock 结果，方便验证交互闭环。"
  };
};

export const optimizeResume = async (request: OptimizeResumeRequest): Promise<OptimizeResumeResult> => {
  const payload = await requestExternalAi("optimize-resume", request);
  if (payload) {
    const markdown = pickText(payload).trim();
    if (!markdown) throw new Error("AI 返回结果缺少优化后的 Markdown 内容。");
    return {
      optimizedResumeMarkdown: markdown,
      updatedAt: new Date().toISOString()
    };
  }

  return {
    optimizedResumeMarkdown: buildLocalOptimizedMarkdown(request.resume, request.jobDescription || request.targetJob || ""),
    updatedAt: new Date().toISOString()
  };
};

export const diagnoseResume = async (resume: ResumeData, jobDescription: string): Promise<DiagnoseResult> => {
  const payload = await requestExternalAi("diagnose-jd", {
    resume,
    resumeText: resumeToPlainText(resume),
    jobDescription,
    canvasBlocks: resumeToCanvasBlocks(resume)
  });

  if (payload) {
    const parsed = parseJsonFromText(pickText(payload)) ?? payload;
    const record = parsed as Record<string, unknown>;
    return {
      score: Number(record.score ?? record.matchScore ?? 0),
      coveredSkills: safeArray(record.coveredSkills),
      missingSkills: safeArray(record.missingSkills),
      weakSections: safeArray(record.weakSections),
      keywords: safeArray(record.keywords),
      suggestions: normalizeSuggestions(record.suggestions, resume)
    };
  }

  return {
    score: jobDescription.trim() ? 68 : 0,
    coveredSkills: ["沟通协作", "学习能力", "项目执行"],
    missingSkills: ["岗位关键词覆盖不足", "结果量化不足"],
    weakSections: ["工作/实习经历", "项目经历"],
    keywords: safeArray(jobDescription).slice(0, 8),
    suggestions: buildLocalSuggestions(resume, "jd_keyword", jobDescription)
  };
};

const clampScore = (value: unknown, fallback = 0) => {
  const score = Math.round(Number(value ?? fallback));
  if (!Number.isFinite(score)) return fallback;
  return Math.min(100, Math.max(0, score));
};

const buildLocalOptimizedMarkdown = (resume: ResumeData, jobDescription: string) => {
  const keywords = safeArray(jobDescription).slice(0, 8).join("、");
  return [
    `# ${resume.personalInfo.name || "候选人"} - ${resume.personalInfo.targetRole || "目标岗位"}`,
    "",
    "## 个人信息",
    [resume.personalInfo.phone, resume.personalInfo.email, resume.personalInfo.city, resume.personalInfo.link].filter(Boolean).join(" / "),
    "",
    "## 求职优势",
    `- 围绕目标 JD 可强化关键词：${keywords || "建议补充 JD 核心关键词"}。`,
    "- 建议将经历描述改为“场景 + 动作 + 方法 + 结果 + 岗位相关性”，缺少数据处请补充真实指标。",
    "",
    "## 教育经历",
    ...resume.education.map((item) => `- ${[item.school, item.degree, item.major, item.startDate && item.endDate ? `${item.startDate}-${item.endDate}` : item.startDate || item.endDate].filter(Boolean).join(" / ")}`),
    "",
    "## 工作/实习经历",
    ...resume.experiences.flatMap((item) => [
      `### ${[item.company, item.role, item.startDate && item.endDate ? `${item.startDate}-${item.endDate}` : item.startDate || item.endDate].filter(Boolean).join(" / ")}`,
      `- ${item.responsibilities || "建议补充该经历的核心职责、方法和交付结果。"}`,
      item.achievements ? `- ${item.achievements}` : "- 建议补充真实量化结果，例如影响范围、效率变化、交付周期或业务指标。"
    ]),
    "",
    "## 项目经历",
    ...resume.projects.flatMap((item) => [
      `### ${[item.name, item.role, item.startDate && item.endDate ? `${item.startDate}-${item.endDate}` : item.startDate || item.endDate].filter(Boolean).join(" / ")}`,
      `- ${item.responsibilities || item.background || "建议补充项目场景、你的动作和岗位相关方法。"}`,
      item.results ? `- ${item.results}` : "- 建议补充真实项目结果；没有数据时使用“建议补充”提示，不编造数字。"
    ]),
    "",
    "## 技能证书",
    `- ${[resume.skills.keywords, resume.skills.tools, resume.skills.languages, resume.skills.certificates].filter(Boolean).join("；") || "建议补充与 JD 相关的技能、工具和证书。"}`
  ].filter((line) => line !== undefined).join("\n");
};

const normalizeJdMatchReport = (value: Record<string, unknown>, resume: ResumeData, jobDescription: string): JdMatchReport => {
  const rawTargetAnalysis = value.targetAnalysis as Record<string, unknown> | undefined;
  const dimensions = value.dimensions as Record<string, unknown> | undefined;
  const skillMatch = clampScore(dimensions?.skillMatch ?? value.skillMatch, 72);
  const experienceMatch = clampScore(dimensions?.experienceMatch ?? value.experienceMatch, 70);
  const projectFit = clampScore(dimensions?.projectFit ?? value.projectFit, 68);
  const contentQuality = clampScore(dimensions?.contentQuality ?? value.contentQuality, 75);
  const totalScore = clampScore(
    value.totalScore ?? value.score,
    Math.round((skillMatch + experienceMatch + projectFit + contentQuality) / 4)
  );
  const atsKeywords = safeArray(value.atsKeywords ?? value.keywords);
  const highlights = richTextArray(value.highlights ?? value.coveredSkills, ["title", "jdRequirement", "resumeEvidence", "analysis"]);
  const gaps = richTextArray(value.gaps ?? value.missingSkills, ["title", "jdRequirement", "currentIssue", "impact", "fixSuggestion"]);
  const structureAdvice = richTextArray(value.structureAdvice ?? value.weakSections, ["title", "targetSection", "action", "reason", "exampleRewrite"]);
  const optimizedResumeMarkdown = String(value.optimizedResumeMarkdown ?? "").trim() || buildLocalOptimizedMarkdown(resume, jobDescription);

  return {
    targetAnalysis: rawTargetAnalysis ? {
      targetRole: String(rawTargetAnalysis.targetRole ?? ""),
      industry: String(rawTargetAnalysis.industry ?? ""),
      seniority: String(rawTargetAnalysis.seniority ?? ""),
      jobFamily: String(rawTargetAnalysis.jobFamily ?? ""),
      coreResponsibilities: safeArray(rawTargetAnalysis.coreResponsibilities),
      requiredSkills: safeArray(rawTargetAnalysis.requiredSkills),
      preferredSkills: safeArray(rawTargetAnalysis.preferredSkills),
      toolsAndMethods: safeArray(rawTargetAnalysis.toolsAndMethods),
      businessScenarios: safeArray(rawTargetAnalysis.businessScenarios),
      hiddenRequirements: safeArray(rawTargetAnalysis.hiddenRequirements)
    } : undefined,
    totalScore,
    candidateSummary: String(value.candidateSummary ?? value.summary ?? "该候选人与目标岗位具备一定匹配度，建议继续强化岗位关键词、项目结果和产品方法表达。"),
    dimensions: {
      skillMatch,
      experienceMatch,
      projectFit,
      contentQuality
    },
    highlights: highlights.length ? highlights : ["已具备部分与 JD 相关的项目、实习或技能基础。"],
    gaps: gaps.length ? gaps : ["简历中岗位关键词和量化结果仍可进一步补充。"],
    structureAdvice: structureAdvice.length ? structureAdvice : ["建议将最贴近目标岗位的实习或项目经历前置，并把职责拆成更清晰的 bullet。"],
    atsKeywords: atsKeywords.length ? atsKeywords : safeArray(jobDescription).slice(0, 12),
    optimizedResumeMarkdown,
    suggestions: normalizeSuggestions(value.suggestions, resume)
  };
};

export const diagnoseJdMatch = async (resume: ResumeData, jobDescription: string): Promise<JdMatchReport> => {
  const input = {
    resume,
    resumeText: resumeToPlainText(resume),
    jobDescription,
    canvasBlocks: resumeToCanvasBlocks(resume)
  };
  const payload = await requestExternalAi("diagnose-jd", input);

  if (payload) {
    const parsed = parseJsonFromText(pickText(payload)) ?? payload;
    return normalizeJdMatchReport(parsed as Record<string, unknown>, resume, jobDescription);
  }

  const keywords = safeArray(jobDescription).slice(0, 12);
  return normalizeJdMatchReport({
    totalScore: jobDescription.trim() ? 76 : 0,
    candidateSummary: "候选人具备一定产品/项目执行基础，若能补充 AI 工具、数据分析和真实结果指标，将更贴近目标岗位。",
    dimensions: {
      skillMatch: 78,
      experienceMatch: 74,
      projectFit: 72,
      contentQuality: 80
    },
    highlights: ["简历中已有项目/实习经历，可承接 JD 中对产品执行和协作能力的要求。", "具备基础工具或技能描述，可进一步贴合 JD 关键词。"],
    gaps: ["部分经历缺少具体结果指标，请补充真实数据。", "岗位关键词覆盖不够集中，建议强化 AI、SaaS、需求分析、原型设计等表达。"],
    structureAdvice: ["将最贴近 JD 的项目或实习经历前置。", "把长段描述拆为“主题 + 动作 + 方法 + 结果”的 bullet。", "对缺少数据的位置保留“建议补充真实指标”，不要编造数字。"],
    atsKeywords: keywords.length ? keywords : ["需求分析", "竞品调研", "原型设计", "数据分析", "PRD", "AI 产品经理"],
    optimizedResumeMarkdown: buildLocalOptimizedMarkdown(resume, jobDescription),
    suggestions: buildLocalSuggestions(resume, "jd_keyword", jobDescription)
  }, resume, jobDescription);
};

const suggestionType = (value: unknown): AiSuggestionType => {
  if (value === "jd_keyword" || value === "quantification" || value === "structure" || value === "expression") return value;
  return "expression";
};

const normalizeSuggestions = (value: unknown, resume: ResumeData): AiSuggestion[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const targetPath = String(record.targetPath ?? record.path ?? "");
      if (!targetPath) return null;
      const originalText = String(record.originalText ?? getResumeValueByPath(resume, targetPath));

      return {
        id: String(record.id ?? randomId()),
        type: suggestionType(record.type),
        targetPath,
        targetBlockId: String(record.targetBlockId ?? blockIdForPath(resume, targetPath)),
        locationLabel: String(record.locationLabel ?? record.location ?? `建议 ${index + 1}`),
        originalText,
        suggestedText: String(record.suggestedText ?? record.after ?? originalText),
        reason: String(record.reason ?? "优化表达，使内容更贴近岗位要求。"),
        risk: String(record.risk ?? "请确认建议内容符合真实经历后再应用。"),
        status: "pending" as const
      };
    })
    .filter(Boolean) as AiSuggestion[];
};

const buildLocalSuggestions = (resume: ResumeData, type: AiSuggestionType = "expression", jobDescription?: string): AiSuggestion[] => {
  const blocks = resumeToCanvasBlocks(resume).filter((block) => block.value.trim());
  const targets = blocks
    .filter((block) => ["experience", "project", "skills"].includes(block.section))
    .slice(0, 4);

  return targets.map((block) => ({
    id: randomId(),
    type,
    targetPath: block.path,
    targetBlockId: block.id,
    locationLabel: block.label,
    originalText: block.value,
    suggestedText:
      type === "quantification"
        ? `${block.value}\n（建议补充真实可验证的数据指标，例如规模、周期、效率或结果，不要直接编造数字。）`
        : `${block.value}\n建议改写：用“动作 + 方法 + 结果”的结构重写，并结合${jobDescription ? "目标 JD 关键词" : "目标岗位能力"}。`,
    reason: type === "jd_keyword" ? "该位置适合补充与 JD 相关的能力关键词。" : "当前表述可以更突出动作、方法和结果。",
    risk: "缺少真实量化数据时，请先补充事实再接受建议。",
    status: "pending"
  }));
};

export const analyzeResume = async (
  resume: ResumeData,
  targetJob?: string,
  jobDescription?: string
): Promise<AnalyzeResumeResult> => {
  const input = {
    resume,
    resumeText: resumeToPlainText(resume),
    targetJob,
    jobDescription,
    canvasBlocks: resumeToCanvasBlocks(resume)
  };
  const payload = await requestExternalAi("analyze-resume", input);

  if (payload) {
    const parsed = parseJsonFromText(pickText(payload)) ?? payload;
    const record = parsed as Record<string, unknown>;
    const report = record.healthReport as AnalyzeResumeResult["healthReport"] | undefined;
    return {
      healthReport: report ?? computeResumeHealthReport(resume),
      suggestions: normalizeSuggestions(record.suggestions, resume)
    };
  }

  return {
    healthReport: computeResumeHealthReport(resume),
    suggestions: buildLocalSuggestions(resume)
  };
};

export const generateSuggestions = async (request: GenerateSuggestionsRequest): Promise<AiSuggestion[]> => {
  const payload = await requestExternalAi("generate-suggestions", {
    ...request,
    resumeText: resumeToPlainText(request.resume),
    canvasBlocks: resumeToCanvasBlocks(request.resume)
  });

  if (payload) {
    const parsed = parseJsonFromText(pickText(payload)) ?? payload;
    const record = parsed as Record<string, unknown>;
    return normalizeSuggestions(record.suggestions ?? parsed, request.resume);
  }

  return buildLocalSuggestions(request.resume, request.scope === "skills" ? "jd_keyword" : "expression", request.jobDescription);
};
