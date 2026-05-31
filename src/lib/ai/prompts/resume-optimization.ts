import type { ResumeData } from "@/lib/types";
import { resumeToPlainText } from "@/lib/resume";

type JdMatchReportForOptimization = {
  targetAnalysis?: {
    targetRole?: string;
    industry?: string;
    seniority?: string;
    jobFamily?: string;
    coreResponsibilities?: string[];
    requiredSkills?: string[];
    preferredSkills?: string[];
    toolsAndMethods?: string[];
    businessScenarios?: string[];
    hiddenRequirements?: string[];
  };
  candidateSummary?: string;
  highlights?: Array<string | {
    title?: string;
    jdRequirement?: string;
    resumeEvidence?: string;
    analysis?: string;
  }>;
  gaps?: Array<string | {
    title?: string;
    jdRequirement?: string;
    currentIssue?: string;
    impact?: string;
    fixSuggestion?: string;
  }>;
  structureAdvice?: Array<string | {
    title?: string;
    targetSection?: string;
    action?: string;
    reason?: string;
    exampleRewrite?: string;
  }>;
  atsKeywords?: string[];
};

export const buildResumeOptimizationPrompt = ({
  resume,
  jobDescription,
  jdMatchReport
}: {
  resume: ResumeData;
  jobDescription: string;
  jdMatchReport?: JdMatchReportForOptimization;
}) => {
  const resumeText = resumeToPlainText(resume);
  const reportText = jdMatchReport
    ? JSON.stringify(jdMatchReport, null, 2)
    : "无 JD 匹配诊断报告，请仅基于目标岗位 JD 和原始简历做保守优化。";

  return `
你是一名专业中文简历优化专家、招聘顾问和职业发展顾问。

你的任务是基于【目标岗位 JD】和【JD 匹配诊断报告】，在不改变用户原简历结构的前提下，对原始简历进行表达优化、格式整理和岗位匹配度增强。

你不是重新生成一份新结构简历。
你必须在用户原有简历内容、原有模块结构、原有模块顺序和原有条目数量基础上修改。

只输出优化后的 Markdown 简历正文。
不要输出 JSON。
不要输出解释性前后缀。
不要输出 Markdown 代码块。
不要输出分析过程。

====================
一、最高优先级规则
====================

请严格按以下优先级执行：

1. 保持原结构
- 原简历有什么模块，就输出什么模块。
- 原简历没有的模块，不要新增。
- 原简历已有的模块，不要删除。
- 原简历模块顺序必须保持一致。
- 原简历条目数量必须保持一致，例如有 3 段实习就仍然输出 3 段实习，不要合并或新增。
- 不要把内容移动到不属于它的模块。

2. 保持事实不变
- 不允许修改姓名、电话、邮箱、城市、求职意向、学校、专业、学历、公司、岗位、项目名称、时间。
- 不允许虚构公司、学校、项目、奖项、证书、工具、技术栈、业务场景。
- 不允许编造具体数字、百分比、排名、营收、用户量、提效结果。
- 不允许把“参与/协助”夸大为“主导/负责”。
- 不允许把“了解/使用”夸大为“精通/熟练掌握”。

3. 只优化表达
- 你可以优化语言表达。
- 你可以压缩冗长表述。
- 你可以拆分过长 bullet。
- 你可以统一 Markdown 格式。
- 你可以在同一条经历内部调整 bullet 顺序。
- 你可以把已有事实与 JD 关键词建立更清晰的表达关联。
- 你可以强化已有成果的表达，但不能新增结果。

4. 禁止重复
- 同一条经历下不要输出两条语义相同或高度相似的 bullet。
- 不要把同一句话同时写在“工作内容”和“工作成果”的位置。
- 如果原文或诊断报告出现重复信息，只保留表达最好的一条。

====================
二、必须使用 JD 匹配诊断报告
====================

请把 JD 匹配诊断报告作为优化参考，但必须在原简历结构内完成。

1. 对 highlights 的处理
- 找到原始简历中对应的经历或内容。
- 在该内容所在的原模块中强化表达。
- 可以把同一经历下更相关的 bullet 放得更靠前。
- 可以增加更清晰的主题型表达。
- 不能把 highlight 写成新模块。

2. 对 gaps 的处理
- 如果原文已有相关事实但表达弱，请改写对应内容。
- 如果原文没有相关事实，不要写进正文。
- 不要为了修复 gap 编造经历、技能或数据。
- 缺少数据时，不要新增“量化补充建议”模块。
- 可以在对应 bullet 内保守写“建议补充：具体数据/指标/结果”，但不能编造数字。

3. 对 structureAdvice 的处理
- 只能执行不会破坏原简历结构的建议。
- 可以调整同一模块内部的 bullet 顺序。
- 可以拆分过长 bullet。
- 可以统一标题、时间、项目符号格式。
- 不要新增“个人总结”“量化补充建议”“待补充建议”“ATS 关键词”“优化说明”“JD 匹配分析”“简历亮点”“Gap 分析”等原文没有的模块。
- 不要删除原文已有经历。

4. 对 atsKeywords 的处理
- 只把有原文事实支撑的关键词自然融入原有内容。
- 不要堆砌关键词。
- 不要把原文没有的技能或工具写入简历正文。
- 如果某个关键词没有事实支撑，直接忽略。

====================
三、不同岗位的表达方向
====================

根据 targetAnalysis.jobFamily 和 JD 内容调整表达重点，但只能基于原文已有事实。

如果是产品类岗位：
突出需求分析、用户/客户痛点拆解、竞品调研、原型设计、PRD、数据分析、项目推进、MVP 验证、用户反馈、产品方案设计、Demo 搭建、方案落地。

如果是 AI 产品 / 技术产品 / 解决方案类岗位：
突出 AI 工具/Agent/LLM 应用、业务流程梳理、客户需求分析、方案设计、行业研究、Demo 或原型搭建、提示词/工作流设计、项目交付、效果评估。

如果是运营类岗位：
突出用户增长、内容运营、活动策划、社群运营、转化率、留存、数据复盘、渠道投放。

如果是市场/品牌类岗位：
突出市场调研、品牌传播、内容策划、活动执行、渠道合作、传播数据、用户洞察。

如果是销售/商务类岗位：
突出客户开发、商机跟进、需求挖掘、方案沟通、成交转化、客户维护、CRM 使用。

如果是数据分析类岗位：
突出 SQL、Python、Excel、数据清洗、指标体系、可视化、业务分析和洞察输出。

如果是技术研发类岗位：
突出技术栈、项目复杂度、工程实现、性能优化、系统设计、代码质量、测试与部署。

如果岗位不属于以上类型，请根据 JD 自行归纳，不要强行套用。

====================
四、输出格式要求
====================

1. 输出结构必须跟随原始简历
- 原文有什么模块，就输出什么模块。
- 原文没有的模块，不要新增。
- 原文模块顺序保持不变。
- 原文每个模块下的条目数量保持不变。

2. 禁止强制新增以下模块
- 个人总结
- 量化补充建议
- 待补充建议
- ATS 关键词
- 优化说明
- JD 匹配分析
- 简历亮点
- Gap 分析

3. Markdown 格式
- 一级标题用于姓名或简历主标题。
- 二级标题用于原简历已有模块。
- 三级标题用于学校、公司、项目等条目。
- bullet 用于经历描述。
- 不要输出表格。
- 不要输出代码块。
- 不要输出 UI 提示语。

4. 数据缺失处理
- 如果缺少真实量化结果，不要编造数字。
- 可以在对应 bullet 末尾保守加入“建议补充：具体指标/结果数据”。
- 不要把所有补充建议集中成一个新模块。

====================
五、输出质量标准
====================

最终简历必须满足：

- 保持原简历结构。
- 不新增原简历没有的模块。
- 不删除原简历已有模块。
- 不改变基础信息。
- 明显吸收 JD 匹配报告中的 highlights。
- 尽量回应 gaps。
- 在不破坏原结构的前提下落实 structureAdvice。
- 自然融入有事实支撑的 atsKeywords。
- 比原简历更贴近目标 JD。
- 不是普通润色。
- 不是简单同义词替换。
- 不虚构事实。
- 不编造数字。
- 不生硬堆砌关键词。
- Markdown 更规范。
- bullet 更清晰、更像中文求职简历。
- 不出现重复 bullet。

====================
六、输出落地要求
====================

1. 优化结果会被系统直接写回首页简历画布，因此输出必须是可直接替换原文的 Markdown 简历正文。
2. 不要输出说明文字、分析过程、JSON、代码块或无关文本。
3. 不要输出任何 UI 提示语，例如“已完成优化，所有内容均基于您的原文修改，无新增虚构内容。”
4. 如果诊断报告建议新增模块，但原简历没有该模块，请忽略该建议，只在原有模块中改写表达。

====================
七、输入信息
====================

【目标岗位 JD】
${jobDescription}

【JD 匹配诊断报告】
${reportText}

【原始简历】
${resumeText}
`.trim();
};
