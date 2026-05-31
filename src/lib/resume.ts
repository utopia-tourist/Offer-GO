import type {
  AiSuggestion,
  CanvasBlock,
  Education,
  Experience,
  ImportMarkdownSections,
  ImportQualityReport,
  Project,
  ResumeChange,
  ResumeData,
  ResumeHealthReport,
  ResumeStyle
} from "@/lib/types";

export const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

export const emptyEducation = (): Education => ({
  id: createId(),
  school: "",
  degree: "",
  major: "",
  startDate: "",
  endDate: "",
  gpa: "",
  courses: "",
  honors: ""
});

export const emptyExperience = (): Experience => ({
  id: createId(),
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  responsibilities: "",
  achievements: ""
});

export const emptyProject = (): Project => ({
  id: createId(),
  name: "",
  role: "",
  startDate: "",
  endDate: "",
  background: "",
  responsibilities: "",
  results: ""
});

export const defaultResumeStyle = (): ResumeStyle => ({
  fontFamily: "system",
  fontSize: 13,
  lineHeight: 1.6,
  paragraphSpacing: 12
});

export const defaultResumeData = (): ResumeData => ({
  personalInfo: {
    name: "张三",
    phone: "13800000000",
    email: "zhangsan@example.com",
    city: "上海",
    targetRole: "AI 产品经理实习生",
    link: "https://portfolio.example.com/zhangsan"
  },
  education: [
    {
      id: createId(),
      school: "上海交通大学",
      degree: "本科",
      major: "信息管理与信息系统",
      startDate: "2022.09",
      endDate: "2026.06",
      gpa: "3.7/4.0",
      courses: "产品管理、数据分析、用户研究、数据库原理、人工智能导论",
      honors: "校级优秀学生干部、互联网+创新创业大赛校赛二等奖"
    }
  ],
  experiences: [
    {
      id: createId(),
      company: "某互联网科技公司",
      role: "产品经理实习生",
      startDate: "2025.06",
      endDate: "2025.09",
      responsibilities: [
        "参与 AI 助手类产品的需求调研，梳理学生求职场景下的简历修改、岗位匹配和面试准备痛点。",
        "协助输出 PRD、用户流程图和低保真原型，推动设计、算法和前端同学对齐 MVP 功能边界。",
        "整理竞品功能矩阵，分析 8 款 AI 简历/求职工具的核心流程、付费点和差异化能力。"
      ].join("\n"),
      achievements: [
        "跟进 2 轮用户访谈和可用性测试，沉淀 15 条体验问题并推动其中 9 条进入迭代计划。",
        "建议补充：功能上线后的使用率、转化率或用户满意度数据。"
      ].join("\n")
    }
  ],
  projects: [
    {
      id: createId(),
      name: "智能简历优化工具",
      role: "产品负责人",
      startDate: "2025.03",
      endDate: "2025.05",
      background: "面向应届生不会写简历、不了解岗位匹配度的问题，设计一款支持简历导入、AI 诊断、逐条优化和 PDF 导出的求职工具。",
      responsibilities: [
        "拆解简历编辑、JD 匹配、AI 优化和导出 PDF 的核心流程，完成产品功能清单、交互原型和关键页面设计。",
        "设计简历质量检查机制，将导入后的个人信息、教育经历、实习经历、项目经历拆分为可编辑字段，降低解析错误对后续优化的影响。",
        "基于目标岗位 JD 设计 AI Prompt 约束，要求模型不虚构经历和数据，只在用户原文基础上优化表达。"
      ].join("\n"),
      results: "完成 MVP 原型和核心功能验证，覆盖导入、诊断、优化、版本保存和导出等主流程。"
    }
  ],
  skills: {
    keywords: "需求分析、用户研究、竞品分析、PRD、原型设计、数据分析、AI 产品、Prompt 设计",
    languages: "英语 CET-6",
    tools: "Axure、Figma、Excel、SQL、Python、Notion、飞书、Coze",
    certificates: "普通话二级甲等"
  },
  style: defaultResumeStyle()
});

export const hasText = (...values: string[]) => values.some((value) => value.trim().length > 0);

export const dateRange = (startDate: string, endDate: string) => {
  if (startDate && endDate) return `${startDate} - ${endDate}`;
  return startDate || endDate;
};

export const resumeToPlainText = (resume: ResumeData) => {
  const lines: string[] = [];
  const { personalInfo } = resume;

  lines.push(`姓名：${personalInfo.name}`);
  lines.push(`求职意向：${personalInfo.targetRole}`);
  lines.push(`联系方式：${[personalInfo.phone, personalInfo.email, personalInfo.city, personalInfo.link].filter(Boolean).join(" / ")}`);

  lines.push("教育经历");
  resume.education.forEach((item) => {
    lines.push([item.school, item.degree, item.major, dateRange(item.startDate, item.endDate)].filter(Boolean).join(" / "));
    lines.push([item.gpa && `GPA：${item.gpa}`, item.courses && `相关课程：${item.courses}`, item.honors && `荣誉：${item.honors}`].filter(Boolean).join("；"));
  });

  lines.push("工作/实习经历");
  resume.experiences.forEach((item) => {
    lines.push([item.company, item.role, dateRange(item.startDate, item.endDate)].filter(Boolean).join(" / "));
    lines.push(item.responsibilities);
    lines.push(item.achievements);
  });

  lines.push("项目经历");
  resume.projects.forEach((item) => {
    lines.push([item.name, item.role, dateRange(item.startDate, item.endDate)].filter(Boolean).join(" / "));
    lines.push(item.background);
    lines.push(item.responsibilities);
    lines.push(item.results);
  });

  lines.push("技能证书");
  lines.push(resume.skills.keywords);
  lines.push(resume.skills.languages);
  lines.push(resume.skills.tools);
  lines.push(resume.skills.certificates);

  return lines.filter((line) => line.trim()).join("\n");
};

export const getResumeStyle = (resume: ResumeData): ResumeStyle => ({
  ...defaultResumeStyle(),
  ...(resume.style ?? {})
});

export const updateResumeStyle = (resume: ResumeData, style: Partial<ResumeStyle>): ResumeData => ({
  ...resume,
  style: {
    ...getResumeStyle(resume),
    ...style
  }
});

const line = (label: string, value: string) => `- ${label}：${value || ""}`;

export const resumeToImportMarkdownSections = (resume: ResumeData): ImportMarkdownSections => ({
  personal: [
    line("姓名", resume.personalInfo.name),
    line("手机号", resume.personalInfo.phone),
    line("邮箱", resume.personalInfo.email),
    line("所在城市", resume.personalInfo.city),
    line("求职意向", resume.personalInfo.targetRole),
    line("个人链接", resume.personalInfo.link)
  ].join("\n"),
  education: resume.education.length
    ? resume.education.map((item, index) => [
        `### 教育经历 ${index + 1}`,
        line("学校", item.school),
        line("学历", item.degree),
        line("专业", item.major),
        line("开始时间", item.startDate),
        line("结束时间", item.endDate),
        line("GPA", item.gpa),
        line("相关课程", item.courses),
        line("荣誉奖项", item.honors)
      ].join("\n")).join("\n\n")
    : "### 教育经历 1\n- 学校：\n- 学历：\n- 专业：\n- 开始时间：\n- 结束时间：\n- GPA：\n- 相关课程：\n- 荣誉奖项：",
  experiences: resume.experiences.length
    ? resume.experiences.map((item, index) => [
        `### 工作/实习经历 ${index + 1}`,
        line("公司", item.company),
        line("职位", item.role),
        line("开始时间", item.startDate),
        line("结束时间", item.endDate),
        line("工作内容", item.responsibilities),
        line("工作成果", item.achievements)
      ].join("\n")).join("\n\n")
    : "### 工作/实习经历 1\n- 公司：\n- 职位：\n- 开始时间：\n- 结束时间：\n- 工作内容：\n- 工作成果：",
  projects: resume.projects.length
    ? resume.projects.map((item, index) => [
        `### 项目经历 ${index + 1}`,
        line("项目名称", item.name),
        line("项目角色", item.role),
        line("开始时间", item.startDate),
        line("结束时间", item.endDate),
        line("项目背景", item.background),
        line("负责内容", item.responsibilities),
        line("项目成果", item.results)
      ].join("\n")).join("\n\n")
    : "### 项目经历 1\n- 项目名称：\n- 项目角色：\n- 开始时间：\n- 结束时间：\n- 项目背景：\n- 负责内容：\n- 项目成果：",
  skills: [
    line("技能关键词", resume.skills.keywords),
    line("语言能力", resume.skills.languages),
    line("工具能力", resume.skills.tools),
    line("证书奖项", resume.skills.certificates)
  ].join("\n")
});

const getMarkdownValue = (text: string, labels: string[]) => {
  const names = labels.map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const match = text.match(new RegExp(`(?:^|\\n)\\s*(?:[-*]\\s*)?(?:${names})\\s*[:：]\\s*([\\s\\S]*?)(?=\\n\\s*(?:[-*]\\s*)?[\\u4e00-\\u9fa5A-Za-z0-9/ -]{1,16}\\s*[:：]|\\n###|$)`, "i"));
  return match?.[1]?.replace(/\n\s{0,4}/g, "\n").trim() ?? "";
};

const splitMarkdownRecords = (text: string, fallbackTitle: string) => {
  const normalized = text.trim();
  if (!normalized) return [];
  const withHeading = /^###\s+/m.test(normalized) ? normalized : `### ${fallbackTitle}\n${normalized}`;
  return withHeading
    .split(/^###\s+/m)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/^[^\n]*\n?/, "").trim())
    .filter(Boolean);
};

export const importMarkdownSectionsToResume = (
  sections: ImportMarkdownSections,
  previous?: ResumeData
): ResumeData => {
  const next = defaultResumeData();

  next.personalInfo = {
    name: getMarkdownValue(sections.personal, ["姓名", "名字"]) || previous?.personalInfo.name || "",
    phone: getMarkdownValue(sections.personal, ["手机号", "电话", "联系方式"]) || previous?.personalInfo.phone || "",
    email: getMarkdownValue(sections.personal, ["邮箱", "Email", "E-mail"]) || previous?.personalInfo.email || "",
    city: getMarkdownValue(sections.personal, ["所在城市", "城市", "所在地"]) || previous?.personalInfo.city || "",
    targetRole: getMarkdownValue(sections.personal, ["求职意向", "目标岗位", "应聘岗位"]) || previous?.personalInfo.targetRole || "",
    link: getMarkdownValue(sections.personal, ["个人链接", "链接", "作品集"]) || previous?.personalInfo.link || ""
  };

  const educationRecords = splitMarkdownRecords(sections.education, "教育经历 1");
  next.education = educationRecords.map((record, index) => ({
    ...emptyEducation(),
    id: previous?.education[index]?.id ?? createId(),
    school: getMarkdownValue(record, ["学校", "院校"]),
    degree: getMarkdownValue(record, ["学历", "学位"]),
    major: getMarkdownValue(record, ["专业"]),
    startDate: getMarkdownValue(record, ["开始时间", "开始日期"]),
    endDate: getMarkdownValue(record, ["结束时间", "结束日期"]),
    gpa: getMarkdownValue(record, ["GPA", "绩点"]),
    courses: getMarkdownValue(record, ["相关课程", "课程"]),
    honors: getMarkdownValue(record, ["荣誉奖项", "奖项", "补充说明"])
  })).filter((item) => hasText(item.school, item.degree, item.major, item.honors));

  const experienceRecords = splitMarkdownRecords(sections.experiences, "工作/实习经历 1");
  next.experiences = experienceRecords.map((record, index) => ({
    ...emptyExperience(),
    id: previous?.experiences[index]?.id ?? createId(),
    company: getMarkdownValue(record, ["公司", "组织", "单位"]),
    role: getMarkdownValue(record, ["职位", "岗位", "角色"]),
    startDate: getMarkdownValue(record, ["开始时间", "开始日期"]),
    endDate: getMarkdownValue(record, ["结束时间", "结束日期"]),
    responsibilities: getMarkdownValue(record, ["工作内容", "职责", "负责内容"]),
    achievements: getMarkdownValue(record, ["工作成果", "成果", "业绩"])
  })).filter((item) => hasText(item.company, item.role, item.responsibilities, item.achievements));

  const projectRecords = splitMarkdownRecords(sections.projects, "项目经历 1");
  next.projects = projectRecords.map((record, index) => ({
    ...emptyProject(),
    id: previous?.projects[index]?.id ?? createId(),
    name: getMarkdownValue(record, ["项目名称", "项目"]),
    role: getMarkdownValue(record, ["项目角色", "角色"]),
    startDate: getMarkdownValue(record, ["开始时间", "开始日期"]),
    endDate: getMarkdownValue(record, ["结束时间", "结束日期"]),
    background: getMarkdownValue(record, ["项目背景", "背景"]),
    responsibilities: getMarkdownValue(record, ["负责内容", "工作内容", "职责"]),
    results: getMarkdownValue(record, ["项目成果", "成果", "结果"])
  })).filter((item) => hasText(item.name, item.role, item.background, item.responsibilities, item.results));

  next.skills = {
    keywords: getMarkdownValue(sections.skills, ["技能关键词", "技能", "专业技能"]),
    languages: getMarkdownValue(sections.skills, ["语言能力", "语言"]),
    tools: getMarkdownValue(sections.skills, ["工具能力", "工具"]),
    certificates: getMarkdownValue(sections.skills, ["证书奖项", "证书", "奖项"])
  };

  next.style = previous?.style ?? defaultResumeStyle();
  return next;
};

type ApplyOptimizedMarkdownResult = {
  resume: ResumeData;
  warnings: string[];
  changedPaths: string[];
};

type MarkdownBlock = {
  heading: string;
  body: string;
  text: string;
};

const normalizeMarkdownText = (value: string) =>
  value
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .trim();

const headingText = (line: string) => line.replace(/^#{1,6}\s*/, "").trim();

const sectionHeadingNames = [
  "个人信息",
  "联系方式",
  "教育经历",
  "教育背景",
  "工作/实习经历",
  "工作实习经历",
  "工作经历",
  "实习经历",
  "项目经历",
  "项目经验",
  "技能证书",
  "专业技能",
  "技能",
  "证书"
];

const compactSectionTitle = (value: string) =>
  value
    .replace(/^#{1,6}\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/[：:|｜\-—_\s]/g, "")
    .trim();

const isUnderline = (value: string) => /^[\s\-_=—–]{3,}$/.test(value.trim());

const isPlainSectionHeading = (lineItem: string, names = sectionHeadingNames) => {
  const title = compactSectionTitle(lineItem);
  if (!title || title.length > 18) return false;
  return names.some((name) => {
    const compactName = compactSectionTitle(name);
    return title === compactName || title.includes(compactName);
  });
};

const extractMarkdownSection = (markdown: string, names: string[]) => {
  const lines = normalizeMarkdownText(markdown).split("\n");
  let start = -1;
  let startDepth = 0;
  let headingMode: "markdown" | "plain" = "markdown";

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;
    const title = match[2].replace(/\s+/g, "");
    if (names.some((name) => title.includes(name))) {
      start = index + 1;
      startDepth = match[1].length;
      break;
    }
  }

  if (start < 0) {
    for (let index = 0; index < lines.length; index += 1) {
      if (!isPlainSectionHeading(lines[index], names)) continue;
      start = index + 1;
      headingMode = "plain";
      break;
    }
  }

  if (start < 0) return "";

  while (start < lines.length && (isUnderline(lines[start]) || !lines[start].trim())) {
    start += 1;
  }

  let end = lines.length;
  for (let index = start; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+(.+)$/);
    if (headingMode === "markdown" && match && match[1].length <= startDepth) {
      end = index;
      break;
    }
    if (headingMode === "plain" && (match || isPlainSectionHeading(lines[index]))) {
      end = index;
      break;
    }
  }

  return lines.slice(start, end).join("\n").trim();
};

const splitPlainSectionBlocks = (section: string, identityGroups: string[][] = []): MarkdownBlock[] => {
  const lines = normalizeMarkdownText(section).split("\n");
  const starts = identityGroups
    .map((identities, groupIndex) => {
      const index = lines.findIndex((lineItem) => blockContainsIdentity({ heading: "", body: lineItem, text: lineItem }, identities));
      return index >= 0 ? { index, groupIndex } : null;
    })
    .filter(Boolean) as { index: number; groupIndex: number }[];

  const uniqueStarts = Array.from(new Map(starts.map((item) => [item.index, item])).values())
    .sort((first, second) => first.index - second.index);

  if (!uniqueStarts.length) return [];

  return uniqueStarts.map((item, position) => {
    const next = uniqueStarts[position + 1]?.index ?? lines.length;
    const recordLines = lines.slice(item.index, next).filter((lineItem) => !isUnderline(lineItem));
    const heading = cleanOptimizedLine(recordLines[0] ?? `条目 ${item.groupIndex + 1}`);
    const body = recordLines.join("\n").trim();
    return {
      heading,
      body,
      text: body
    };
  }).filter((block) => block.text.trim());
};

const splitLooseSectionBlocks = (section: string): MarkdownBlock[] => {
  const lines = normalizeMarkdownText(section)
    .split("\n")
    .filter((lineItem) => !isUnderline(lineItem));
  const blocks: MarkdownBlock[] = [];
  let current: string[] = [];

  const flush = () => {
    const body = current.join("\n").trim();
    if (!body) return;
    blocks.push({
      heading: cleanOptimizedLine(current[0] ?? ""),
      body,
      text: body
    });
  };

  for (const lineItem of lines) {
    const cleaned = lineItem.trim();
    if (!cleaned) continue;
    const isBullet = /^\s*(?:[-*+]|\d+[.)])\s+/.test(lineItem);
    const looksLikeRecordStart = !isBullet && (/[|｜]/.test(cleaned) || /\d{4}[./-]\d{1,2}/.test(cleaned));

    if (looksLikeRecordStart && current.length) {
      flush();
      current = [lineItem];
    } else {
      current.push(lineItem);
    }
  }

  flush();
  return blocks.length > 1 ? blocks : [];
};

const splitMarkdownBlocks = (section: string, identityGroups: string[][] = []): MarkdownBlock[] => {
  const lines = normalizeMarkdownText(section).split("\n");
  const blocks: MarkdownBlock[] = [];
  let currentHeading = "";
  let currentBody: string[] = [];

  const flush = () => {
    const body = currentBody.join("\n").trim();
    const text = [currentHeading, body].filter(Boolean).join("\n").trim();
    if (text) blocks.push({ heading: currentHeading, body, text });
  };

  for (const lineItem of lines) {
    const match = lineItem.match(/^(#{3,6})\s+(.+)$/);
    if (match) {
      flush();
      currentHeading = headingText(lineItem);
      currentBody = [];
    } else {
      currentBody.push(lineItem);
    }
  }

  flush();
  if (blocks.length > 1 || (blocks.length === 1 && blocks[0].heading)) return blocks;

  const plainBlocks = splitPlainSectionBlocks(section, identityGroups);
  if (plainBlocks.length) return plainBlocks;

  const looseBlocks = splitLooseSectionBlocks(section);
  if (looseBlocks.length) return looseBlocks;

  return blocks.length ? blocks : [{ heading: "", body: section, text: section }];
};

const compactIdentity = (value: string) =>
  value
    .toLowerCase()
    .replace(/[（(].*?[）)]/g, "")
    .replace(/[^\u4e00-\u9fa5a-z0-9]/g, "");

const blockContainsIdentity = (block: MarkdownBlock, identities: string[]) => {
  const text = compactIdentity(block.text);
  return identities
    .map(compactIdentity)
    .filter((identity) => identity.length >= 2)
    .some((identity) => text.includes(identity));
};

const cleanOptimizedLine = (lineItem: string) =>
  lineItem
    .replace(/^#{1,6}\s*/, "")
    .replace(/^\s*(?:[-*+]|[0-9]+[.)]|[（(]?[一二三四五六七八九十]+[）)、.])\s*/, "")
    .replace(/\*\*/g, "")
    .trim();

const isFactualLine = (lineItem: string, facts: string[]) => {
  const compactLine = compactIdentity(lineItem);
  const hasFact = facts
    .map(compactIdentity)
    .filter((fact) => fact.length >= 2)
    .some((fact) => compactLine.includes(fact));
  return hasFact || /(电话|手机|邮箱|求职意向|学校|公司|项目名称|职位|岗位|角色|时间|开始|结束|学历|学位|专业|GPA)/i.test(lineItem);
};

const extractExpressionLines = (block: MarkdownBlock, facts: string[]) =>
  block.body
    .split("\n")
    .map(cleanOptimizedLine)
    .filter(Boolean)
    .filter((lineItem) => !isFactualLine(lineItem, facts));

const resultLikePattern = /(结果|成果|成效|提升|降低|减少|完成|交付|产出|输出|转化|效率|准确|命中|覆盖|节省|缩短|增长|落地|复盘|验证|建议补充|X%|\d+%|\d+\s*(?:份|个|场|次|项|小时|天|周|月))/;
const backgroundLikePattern = /(背景|场景|问题|目标|痛点|需求|面向|围绕)/;

const normalizeComparableLine = (lineItem: string) =>
  cleanOptimizedLine(lineItem)
    .replace(/[，。；：、,.；;:]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();

const joinLines = (lines: string[]) => {
  const seen = new Set<string>();
  const next: string[] = [];

  lines
    .map((lineItem) => lineItem.trim())
    .filter(Boolean)
    .forEach((lineItem) => {
      const comparable = normalizeComparableLine(lineItem);
      if (!comparable || seen.has(comparable)) return;
      seen.add(comparable);
      next.push(lineItem);
    });

  return next.join("\n");
};

const findMatchedBlock = <T>(
  blocks: MarkdownBlock[],
  items: T[],
  index: number,
  identities: string[]
) => {
  const matched = blocks.find((block) => blockContainsIdentity(block, identities));
  if (matched) return matched;
  if (blocks.length === items.length) return blocks[index];
  return undefined;
};

export const applyOptimizedMarkdownToResume = (
  markdown: string,
  baseResume: ResumeData
): ApplyOptimizedMarkdownResult => {
  const next = structuredClone(baseResume);
  const warnings: string[] = [];
  const changedPaths: string[] = [];

  const updateField = (path: string, value: string, allowEmpty = false) => {
    const cleaned = value.trim();
    if (!cleaned && !allowEmpty) return;
    const current = getResumeValueByPath(next, path).trim();
    if (current === cleaned) return;
    const updated = setResumeValueByPath(next, path, cleaned);
    Object.assign(next, updated);
    changedPaths.push(path);
  };

  const educationSection = extractMarkdownSection(markdown, ["教育经历", "教育背景"]);
  if (educationSection) {
    const blocks = splitMarkdownBlocks(
      educationSection,
      next.education.map((item) => [item.school, item.major, item.degree])
    );
    next.education.forEach((item, index) => {
      const block = findMatchedBlock(blocks, next.education, index, [item.school, item.major, item.degree]);
      if (!block) {
        warnings.push(`教育经历第 ${index + 1} 段未能可靠匹配，已保留原内容。`);
        return;
      }
      const lines = extractExpressionLines(block, [item.school, item.major, item.degree, item.startDate, item.endDate]);
      const courses = lines.filter((lineItem) => /(课程|研究方向|专业方向|主修|学习)/.test(lineItem));
      const honors = lines.filter((lineItem) => !courses.includes(lineItem));
      updateField(`education.${index}.courses`, joinLines(courses) || item.courses);
      updateField(`education.${index}.honors`, joinLines(honors) || item.honors);
    });
  }

  const experienceSection = extractMarkdownSection(markdown, ["工作实习经历", "工作/实习经历", "工作经历", "实习经历"]);
  if (experienceSection) {
    const blocks = splitMarkdownBlocks(
      experienceSection,
      next.experiences.map((item) => [item.company, item.role])
    );
    next.experiences.forEach((item, index) => {
      const block = findMatchedBlock(blocks, next.experiences, index, [item.company, item.role]);
      if (!block) {
        warnings.push(`工作/实习经历第 ${index + 1} 段未能可靠匹配，已保留原内容。`);
        return;
      }
      const lines = extractExpressionLines(block, [item.company, item.role, item.startDate, item.endDate]);
      const achievements = lines.filter((lineItem) => resultLikePattern.test(lineItem));
      const responsibilities = lines.filter((lineItem) => !achievements.includes(lineItem));
      if (responsibilities.length) {
        updateField(`experiences.${index}.responsibilities`, joinLines(responsibilities));
        updateField(`experiences.${index}.achievements`, joinLines(achievements), true);
      } else if (achievements.length) {
        updateField(`experiences.${index}.responsibilities`, joinLines(achievements));
        updateField(`experiences.${index}.achievements`, "", true);
      }
    });
  }

  const projectSection = extractMarkdownSection(markdown, ["项目经历", "项目经验"]);
  if (projectSection) {
    const blocks = splitMarkdownBlocks(
      projectSection,
      next.projects.map((item) => [item.name, item.role])
    );
    next.projects.forEach((item, index) => {
      const block = findMatchedBlock(blocks, next.projects, index, [item.name, item.role]);
      if (!block) {
        warnings.push(`项目经历第 ${index + 1} 段未能可靠匹配，已保留原内容。`);
        return;
      }
      const lines = extractExpressionLines(block, [item.name, item.role, item.startDate, item.endDate]);
      const backgrounds = lines.filter((lineItem) => backgroundLikePattern.test(lineItem));
      const results = lines.filter((lineItem) => resultLikePattern.test(lineItem));
      const responsibilities = lines.filter((lineItem) => !backgrounds.includes(lineItem) && !results.includes(lineItem));
      updateField(`projects.${index}.background`, joinLines(backgrounds) || item.background);
      if (responsibilities.length) {
        updateField(`projects.${index}.responsibilities`, joinLines(responsibilities));
        updateField(`projects.${index}.results`, joinLines(results), true);
      } else if (results.length) {
        updateField(`projects.${index}.responsibilities`, joinLines(results));
        updateField(`projects.${index}.results`, "", true);
      }
    });
  }

  const skillsSection = extractMarkdownSection(markdown, ["技能证书", "专业技能", "技能", "证书"]);
  if (skillsSection) {
    const lines = skillsSection
      .split("\n")
      .map(cleanOptimizedLine)
      .filter(Boolean)
      .filter((lineItem) => !/^#{1,6}/.test(lineItem));

    const tools = lines.filter((lineItem) => /(工具|平台|软件|系统|原型|Figma|Axure|SQL|Python|Coze|Dify|Agent|LLM|Excel)/i.test(lineItem));
    const certificates = lines.filter((lineItem) => /(证书|资格|奖项|认证|获奖)/.test(lineItem));
    const languages = lines.filter((lineItem) => /(语言|英语|CET|IELTS|TOEFL|雅思|托福)/i.test(lineItem));
    const keywords = lines.filter((lineItem) => !tools.includes(lineItem) && !certificates.includes(lineItem) && !languages.includes(lineItem));

    updateField("skills.keywords", joinLines(keywords.length ? keywords : lines));
    updateField("skills.tools", joinLines(tools) || next.skills.tools);
    updateField("skills.certificates", joinLines(certificates) || next.skills.certificates);
    updateField("skills.languages", joinLines(languages) || next.skills.languages);
  }

  if (!changedPaths.length) {
    warnings.push("未能从优化 Markdown 中识别到可自动写回的表达字段，请在画布中继续手动精调。");
  }

  return { resume: next, warnings, changedPaths };
};

type FlatField = {
  label: string;
  path: string;
  value: string;
};

const normalize = (value: string) => value.replace(/\r\n/g, "\n").trim();

export const flattenResume = (resume: ResumeData): FlatField[] => {
  const fields: FlatField[] = [
    { label: "姓名", path: "personalInfo.name", value: resume.personalInfo.name },
    { label: "手机号", path: "personalInfo.phone", value: resume.personalInfo.phone },
    { label: "邮箱", path: "personalInfo.email", value: resume.personalInfo.email },
    { label: "所在城市", path: "personalInfo.city", value: resume.personalInfo.city },
    { label: "求职意向", path: "personalInfo.targetRole", value: resume.personalInfo.targetRole },
    { label: "个人链接", path: "personalInfo.link", value: resume.personalInfo.link },
    { label: "技能关键词", path: "skills.keywords", value: resume.skills.keywords },
    { label: "语言能力", path: "skills.languages", value: resume.skills.languages },
    { label: "工具能力", path: "skills.tools", value: resume.skills.tools },
    { label: "证书奖项", path: "skills.certificates", value: resume.skills.certificates }
  ];

  resume.education.forEach((item, index) => {
    const prefix = `education.${index}`;
    const title = item.school || `教育经历 ${index + 1}`;
    fields.push(
      { label: `${title} - 学校`, path: `${prefix}.school`, value: item.school },
      { label: `${title} - 学历`, path: `${prefix}.degree`, value: item.degree },
      { label: `${title} - 专业`, path: `${prefix}.major`, value: item.major },
      { label: `${title} - 开始时间`, path: `${prefix}.startDate`, value: item.startDate },
      { label: `${title} - 结束时间`, path: `${prefix}.endDate`, value: item.endDate },
      { label: `${title} - GPA`, path: `${prefix}.gpa`, value: item.gpa },
      { label: `${title} - 相关课程`, path: `${prefix}.courses`, value: item.courses },
      { label: `${title} - 荣誉奖项`, path: `${prefix}.honors`, value: item.honors }
    );
  });

  resume.experiences.forEach((item, index) => {
    const prefix = `experiences.${index}`;
    const title = item.company || `工作/实习经历 ${index + 1}`;
    fields.push(
      { label: `${title} - 公司`, path: `${prefix}.company`, value: item.company },
      { label: `${title} - 职位`, path: `${prefix}.role`, value: item.role },
      { label: `${title} - 开始时间`, path: `${prefix}.startDate`, value: item.startDate },
      { label: `${title} - 结束时间`, path: `${prefix}.endDate`, value: item.endDate },
      { label: `${title} - 工作内容`, path: `${prefix}.responsibilities`, value: item.responsibilities },
      { label: `${title} - 工作成果`, path: `${prefix}.achievements`, value: item.achievements }
    );
  });

  resume.projects.forEach((item, index) => {
    const prefix = `projects.${index}`;
    const title = item.name || `项目经历 ${index + 1}`;
    fields.push(
      { label: `${title} - 项目名称`, path: `${prefix}.name`, value: item.name },
      { label: `${title} - 项目角色`, path: `${prefix}.role`, value: item.role },
      { label: `${title} - 开始时间`, path: `${prefix}.startDate`, value: item.startDate },
      { label: `${title} - 结束时间`, path: `${prefix}.endDate`, value: item.endDate },
      { label: `${title} - 项目背景`, path: `${prefix}.background`, value: item.background },
      { label: `${title} - 负责内容`, path: `${prefix}.responsibilities`, value: item.responsibilities },
      { label: `${title} - 项目成果`, path: `${prefix}.results`, value: item.results }
    );
  });

  return fields;
};

export const diffResume = (before: ResumeData, after: ResumeData): ResumeChange[] => {
  const beforeFields = new Map(flattenResume(before).map((field) => [field.path, field]));
  const afterFields = flattenResume(after);

  return afterFields
    .map((field) => {
      const previous = beforeFields.get(field.path);
      const beforeValue = previous?.value ?? "";
      if (normalize(beforeValue) === normalize(field.value)) return null;

      return {
        id: field.path,
        label: field.label,
        path: field.path,
        before: beforeValue,
        after: field.value
      };
    })
    .filter(Boolean) as ResumeChange[];
};

export const setResumeValueByPath = (resume: ResumeData, path: string, value: string): ResumeData => {
  const next = structuredClone(resume);
  const parts = path.split(".");
  let cursor: Record<string, unknown> | unknown[] = next as unknown as Record<string, unknown>;

  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    cursor = Array.isArray(cursor) ? cursor[Number(part)] as Record<string, unknown> : cursor[part] as Record<string, unknown>;
  }

  const last = parts[parts.length - 1];
  if (Array.isArray(cursor)) {
    cursor[Number(last)] = value;
  } else {
    cursor[last] = value;
  }

  return next;
};

export const getResumeValueByPath = (resume: ResumeData, path: string) => {
  const parts = path.split(".");
  let cursor: unknown = resume;

  for (const part of parts) {
    if (cursor == null) return "";
    cursor = Array.isArray(cursor)
      ? cursor[Number(part)]
      : (cursor as Record<string, unknown>)[part];
  }

  return typeof cursor === "string" ? cursor : "";
};

const pushBlock = (
  blocks: CanvasBlock[],
  block: Omit<CanvasBlock, "value">,
  resume: ResumeData
) => {
  const value = getResumeValueByPath(resume, block.path);
  blocks.push({ ...block, value });
};

export const resumeToCanvasBlocks = (resume: ResumeData): CanvasBlock[] => {
  const blocks: CanvasBlock[] = [];

  pushBlock(blocks, { id: "personal-name", section: "personal", label: "姓名", path: "personalInfo.name" }, resume);
  pushBlock(blocks, { id: "personal-role", section: "personal", label: "求职意向", path: "personalInfo.targetRole" }, resume);
  pushBlock(blocks, { id: "personal-phone", section: "personal", label: "手机号", path: "personalInfo.phone" }, resume);
  pushBlock(blocks, { id: "personal-email", section: "personal", label: "邮箱", path: "personalInfo.email" }, resume);
  pushBlock(blocks, { id: "personal-city", section: "personal", label: "所在城市", path: "personalInfo.city" }, resume);
  pushBlock(blocks, { id: "personal-link", section: "personal", label: "个人链接", path: "personalInfo.link" }, resume);

  resume.education.forEach((item, index) => {
    const title = item.school || `教育经历 ${index + 1}`;
    [
      ["school", "学校"],
      ["degree", "学历"],
      ["major", "专业"],
      ["startDate", "开始时间"],
      ["endDate", "结束时间"],
      ["gpa", "GPA"],
      ["courses", "相关课程"],
      ["honors", "荣誉奖项"]
    ].forEach(([field, label]) => {
      pushBlock(blocks, {
        id: `education-${item.id}-${field}`,
        itemId: item.id,
        section: "education",
        label: `${title} - ${label}`,
        path: `education.${index}.${field}`,
        multiline: ["courses", "honors"].includes(field)
      }, resume);
    });
  });

  resume.experiences.forEach((item, index) => {
    const title = item.company || `工作/实习经历 ${index + 1}`;
    [
      ["company", "公司"],
      ["role", "职位"],
      ["startDate", "开始时间"],
      ["endDate", "结束时间"],
      ["responsibilities", "工作内容"],
      ["achievements", "工作成果"]
    ].forEach(([field, label]) => {
      pushBlock(blocks, {
        id: `experience-${item.id}-${field}`,
        itemId: item.id,
        section: "experience",
        label: `${title} - ${label}`,
        path: `experiences.${index}.${field}`,
        multiline: ["responsibilities", "achievements"].includes(field)
      }, resume);
    });
  });

  resume.projects.forEach((item, index) => {
    const title = item.name || `项目经历 ${index + 1}`;
    [
      ["name", "项目名称"],
      ["role", "项目角色"],
      ["startDate", "开始时间"],
      ["endDate", "结束时间"],
      ["background", "项目背景"],
      ["responsibilities", "负责内容"],
      ["results", "项目成果"]
    ].forEach(([field, label]) => {
      pushBlock(blocks, {
        id: `project-${item.id}-${field}`,
        itemId: item.id,
        section: "project",
        label: `${title} - ${label}`,
        path: `projects.${index}.${field}`,
        multiline: ["background", "responsibilities", "results"].includes(field)
      }, resume);
    });
  });

  [
    ["keywords", "技能关键词"],
    ["languages", "语言能力"],
    ["tools", "工具能力"],
    ["certificates", "证书奖项"]
  ].forEach(([field, label]) => {
    pushBlock(blocks, {
      id: `skills-${field}`,
      section: "skills",
      label,
      path: `skills.${field}`,
      multiline: true
    }, resume);
  });

  return blocks;
};

export const blockIdForPath = (resume: ResumeData, path: string) =>
  resumeToCanvasBlocks(resume).find((block) => block.path === path)?.id ?? path.replaceAll(".", "-");

export const applySuggestionToResume = (resume: ResumeData, suggestion: AiSuggestion, text = suggestion.suggestedText) =>
  setResumeValueByPath(resume, suggestion.targetPath, text);

export const buildImportQualityReport = (resume: ResumeData): ImportQualityReport => {
  const warnings: string[] = [];
  const personalRecognized = hasText(resume.personalInfo.name, resume.personalInfo.phone, resume.personalInfo.email);
  const educationCount = resume.education.filter((item) => hasText(item.school, item.major, item.degree, item.honors)).length;
  const experienceCount = resume.experiences.filter((item) => hasText(item.company, item.role, item.responsibilities, item.achievements)).length;
  const projectCount = resume.projects.filter((item) => hasText(item.name, item.role, item.responsibilities, item.results)).length;
  const skillsRecognized = hasText(resume.skills.keywords, resume.skills.tools, resume.skills.certificates, resume.skills.languages);

  if (!personalRecognized) warnings.push("个人信息识别不完整，请确认姓名、手机号和邮箱。");
  if (educationCount < 1) warnings.push("教育经历未识别，请手动补充或重新上传。");
  if (educationCount === 1) warnings.push("仅识别到 1 段教育经历，如有本科/硕士多段背景请确认。");
  if (experienceCount < 1) warnings.push("工作/实习经历未识别，请确认是否需要补充。");
  if (experienceCount === 1) warnings.push("仅识别到 1 段工作/实习经历，如有多段经历请确认。");
  if (projectCount < 1) warnings.push("项目经历未识别，请手动补充或重新上传。");
  if (!skillsRecognized) warnings.push("技能证书未识别，请确认是否需要补充。");

  const confidence = warnings.length <= 1 ? "high" : warnings.length <= 3 ? "medium" : "low";

  return {
    personalInfo: personalRecognized ? "recognized" : "missing",
    educationCount,
    experienceCount,
    projectCount,
    skillsRecognized,
    warnings,
    confidence
  };
};

export const computeResumeHealthReport = (resume: ResumeData, jdMatchScore?: number): ResumeHealthReport => {
  const blocks = resumeToCanvasBlocks(resume);
  const filled = blocks.filter((block) => block.value.trim()).length;
  const completenessScore = Math.round((filled / Math.max(blocks.length, 1)) * 100);
  const text = resumeToPlainText(resume);
  const quantifiableMatches = text.match(/\d+|%|人|万|次|小时|天|周|月|GMV|ROI/gi)?.length ?? 0;
  const actionMatches = text.match(/负责|主导|搭建|设计|分析|协同|推进|优化|交付|沉淀/g)?.length ?? 0;
  const quantificationScore = Math.min(100, Math.round(quantifiableMatches * 12));
  const professionalScore = Math.min(100, Math.max(35, Math.round(actionMatches * 8 + quantificationScore * 0.35)));
  const majorIssues: string[] = [];
  const prioritySections: string[] = [];

  if (completenessScore < 70) majorIssues.push("简历信息完整度偏低，建议补齐教育、经历、项目和技能模块。");
  if (professionalScore < 70) majorIssues.push("经历描述偏口语或流水账，建议使用动作、方法、结果结构。");
  if (quantificationScore < 60) majorIssues.push("量化结果不足，建议补充真实可验证的数据指标。");
  if (!resume.experiences.length) prioritySections.push("工作/实习经历");
  if (!resume.projects.length) prioritySections.push("项目经历");
  if (!hasText(resume.skills.keywords, resume.skills.tools)) prioritySections.push("技能证书");
  if (!prioritySections.length) prioritySections.push("工作/实习经历", "项目经历");

  return {
    completenessScore,
    professionalScore,
    quantificationScore,
    jdMatchScore,
    majorIssues: majorIssues.length ? majorIssues : ["整体结构已具备，可继续强化岗位关键词和结果量化。"],
    prioritySections: [...new Set(prioritySections)]
  };
};
