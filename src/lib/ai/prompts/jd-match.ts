import type { ResumeData } from "@/lib/types";
import { buildResumeOptimizationPrompt } from "@/lib/ai/prompts/resume-optimization";
import { resumeToPlainText } from "@/lib/resume";

const outputSchema = {
  targetAnalysis: {
    targetRole: "目标岗位名称",
    industry: "所属行业或业务领域",
    seniority: "岗位层级，例如实习生、应届生、初级、中级、高级、管理岗",
    jobFamily: "岗位族，例如产品、运营、市场、销售、咨询、技术、数据、设计、职能、供应链等",
    coreResponsibilities: ["JD 中的核心职责"],
    requiredSkills: ["JD 明确要求的必备技能"],
    preferredSkills: ["JD 中的加分项或优先项"],
    toolsAndMethods: ["工具、软件、方法论、技术栈"],
    businessScenarios: ["业务场景关键词"],
    hiddenRequirements: ["JD 中隐含但重要的能力要求"]
  },
  totalScore: 0,
  candidateSummary: "一句话候选人画像总结",
  dimensions: {
    skillMatch: 0,
    experienceMatch: 0,
    projectFit: 0,
    contentQuality: 0
  },
  scoreRationale: {
    skillMatch: "技能匹配评分依据",
    experienceMatch: "经验匹配评分依据",
    projectFit: "项目贴合评分依据",
    contentQuality: "内容规范评分依据"
  },
  highlights: [
    {
      title: "亮点标题",
      jdRequirement: "对应 JD 的具体要求",
      resumeEvidence: "简历中的具体证据",
      analysis: "为什么这能证明匹配，以及还可如何增强"
    }
  ],
  gaps: [
    {
      title: "Gap 标题",
      jdRequirement: "对应 JD 的具体要求",
      currentIssue: "当前简历为什么不够",
      impact: "会影响筛选或面试判断的地方",
      fixSuggestion: "应如何补充或改写"
    }
  ],
  structureAdvice: [
    {
      title: "结构建议标题",
      targetSection: "个人总结 / 教育经历 / 实习经历 / 项目经历 / 校园经历 / 科研经历 / 技能证书等",
      action: "具体调整动作",
      reason: "为什么这样调整",
      exampleRewrite: "可参考的改写方向，不虚构事实和数字"
    }
  ],
  atsKeywords: ["短关键词"],
  optimizedResumeMarkdown: "优化后的 Markdown 简历正文",
  suggestions: [
    {
      type: "jd_keyword",
      targetPath: "skills.keywords",
      locationLabel: "技能证书",
      originalText: "原文",
      suggestedText: "建议改写",
      reason: "原因",
      risk: "风险提示"
    }
  ]
};

const jobFamilyRules = [
  "产品类：重点看用户需求、竞品分析、PRD、原型设计、数据分析、项目推进、MVP 验证、用户反馈。",
  "运营类：重点看用户增长、内容运营、活动策划、社群运营、转化率、留存、数据复盘、渠道投放。",
  "市场/品牌类：重点看市场调研、品牌传播、内容策划、活动执行、渠道合作、传播数据、用户洞察。",
  "销售/商务类：重点看客户开发、商机跟进、需求挖掘、方案沟通、成交转化、客户维护、CRM 使用。",
  "咨询/解决方案类：重点看行业研究、客户需求分析、业务诊断、方案设计、标书/材料输出、项目交付、客户沟通。",
  "数据分析类：重点看 SQL、Python、Excel、数据清洗、指标体系、可视化、业务分析、洞察输出。",
  "技术研发类：重点看技术栈、项目复杂度、工程实现、性能优化、系统设计、代码质量、测试与部署。",
  "设计类：重点看作品集、用户体验、视觉设计、交互设计、设计工具、设计规范、用户研究。",
  "财务/金融类：重点看财务分析、建模、报表、风控、审计、投研、Excel/CPA/CFA 等。",
  "人力/行政类：重点看招聘、员工关系、培训、绩效、流程管理、沟通协调。",
  "供应链/采购类：重点看供应商管理、采购流程、库存管理、成本控制、物流协同、数据分析。",
  "如果 JD 不属于以上岗位族，必须根据 JD 自行归纳，不要强行套用。"
];

export const buildJdMatchPrompt = ({
  resume,
  jobDescription
}: {
  resume: ResumeData;
  jobDescription: string;
}) => [
  "你是通用行业 JD 匹配诊断专家。请基于“目标岗位 JD + 用户简历”生成高质量、可解析的 JD 匹配诊断 JSON。",
  "不要预设用户投递产品经理。所有诊断、评分、关键词、优化建议都必须来自 JD 本身，并动态适配岗位族、行业、层级和业务场景。",
  "只能输出 JSON，不要输出 Markdown 代码块，不要输出解释性前后缀。",
  "",
  "一、先做 JD 解析，再诊断简历",
  "你必须先从 JD 中识别 targetAnalysis：targetRole、industry、seniority、jobFamily、coreResponsibilities、requiredSkills、preferredSkills、toolsAndMethods、businessScenarios、hiddenRequirements。",
  "然后基于 targetAnalysis 逐项评估简历中的证据，不能套用固定话术。",
  "",
  "二、通用岗位族判断规则",
  ...jobFamilyRules,
  "",
  "三、评分维度与权重",
  "评分固定为四项，所有分数必须为 0-100 的整数：",
  "- skillMatch 技能匹配：硬技能、软技能、工具、方法论、证书、语言能力、技术栈是否匹配 JD。",
  "- experienceMatch 经验匹配：实习、项目、工作、校园、科研、社团经历是否支撑 JD 要求。",
  "- projectFit 项目贴合：项目或经历是否贴近岗位业务场景、工作内容、行业方向和交付成果。",
  "- contentQuality 内容规范：表达是否清晰、专业、量化充分、结构合理、关键词突出，是否适合 ATS 或人工筛选。",
  "totalScore 按权重综合：skillMatch 25%，experienceMatch 30%，projectFit 25%，contentQuality 20%。",
  "scoreRationale 必须分别解释四个评分，说明 JD 依据、简历证据和扣分原因。",
  "",
  "四、输出 JSON 结构必须完全稳定",
  JSON.stringify(outputSchema, null, 2),
  "",
  "五、内容质量要求",
  "candidateSummary：必须根据 JD 动态生成候选人画像，不得写成固定产品经理方向。示例：数据分析岗要提到 SQL/Python/指标/业务洞察；运营岗要提到内容、活动、增长、转化；咨询/解决方案岗要提到行业研究、客户需求、方案输出和交付。",
  "highlights：每条必须包含 JD 具体要求、简历具体证据、为什么能证明匹配。不要写“具备相关经验”“基础较好”这类空话。",
  "gaps：每条必须说明缺什么、对应 JD 哪项要求、当前简历为什么不够、会影响什么、应该怎么补。",
  "structureAdvice：必须具体到简历模块，例如个人总结、教育经历、实习经历、项目经历、校园经历、科研经历、技能证书；每条都要说明怎么调、为什么调，并给出不虚构事实的改写方向。",
  "atsKeywords：必须是 12-20 个短关键词，每个 2-12 个字为宜；来自 JD 和简历匹配分析；不要直接复制整句 JD。",
  "",
  "六、事实约束",
  "严格禁止虚构学校、公司、项目、奖项、证书、工具、方法、技术栈、业务场景或具体数字。",
  "不得改变经历时间线；不得把“参与/协助”夸大为“主导/负责”。",
  "如果原文缺少量化数据，只能提示用户补充真实数据，例如“建议补充：活动参与人数/转化率/留存变化”，不能编造。",
  "可以优化表达、重组结构、强化岗位相关性，但不能改变事实。",
  "",
  "七、optimizedResumeMarkdown 生成逻辑",
  "优化后的简历必须通用适配 targetAnalysis.jobFamily，不要固定产品经理表达：",
  "- 产品岗突出需求分析、原型、数据、项目推进。",
  "- 运营岗突出增长、内容、活动、转化、复盘。",
  "- 数据岗突出工具、指标、分析过程、业务洞察。",
  "- 咨询/解决方案岗突出客户需求、行业研究、方案设计、交付。",
  "- 技术岗突出技术栈、系统实现、问题解决、性能或工程结果。",
  "- 市场岗突出调研、传播、活动、渠道、品牌效果。",
  "- 销售岗突出客户、商机、需求挖掘、转化、维护。",
  "- 职能岗突出流程、沟通、执行、合规、效率。",
  "输出 Markdown 简历时保持事实真实，只优化表达和结构；缺少数据时使用“建议补充：XXX”。",
  "optimizedResumeMarkdown 的具体写作约束还必须遵守以下简历优化 Prompt：",
  buildResumeOptimizationPrompt({ resume, jobDescription, jdMatchReport: outputSchema }),
  "",
  "八、逐条修改 suggestions 要求",
  "suggestions 必须能映射到简历结构路径。targetPath 尽量使用输入简历中的字段路径，例如 experiences.0.responsibilities、projects.1.results、skills.keywords。",
  "type 只能是 jd_keyword、expression、quantification、structure。",
  "suggestedText 只改写原字段内容，不得新增不存在的事实；risk 中必须提示需要用户确认事实真实性。",
  "",
  `用户简历纯文本：\n${resumeToPlainText(resume)}`,
  `目标岗位 JD：\n${jobDescription}`
].join("\n\n");
