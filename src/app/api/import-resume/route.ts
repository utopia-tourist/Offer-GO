import { NextResponse } from "next/server";
import {
  buildImportQualityReport,
  defaultResumeData,
  emptyEducation,
  emptyExperience,
  emptyProject
} from "@/lib/resume";
import type { ResumeData } from "@/lib/types";

const textDecoder = new TextDecoder("utf-8");
const artifactPattern = /�|Ã|Â|â€|鈥|锛|绠|鍚|涓|妗/g;

const artifactScore = (value: string) => value.match(artifactPattern)?.length ?? 0;

const decodeTextBuffer = (buffer: Buffer) => {
  const utf8 = textDecoder.decode(buffer);
  try {
    const gb18030 = new TextDecoder("gb18030").decode(buffer);
    return artifactScore(gb18030) < artifactScore(utf8) ? gb18030 : utf8;
  } catch {
    return utf8;
  }
};

const clean = (value: string) => value.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();

const normalizeImportedText = (value: string) =>
  value
    .replace(/\r/g, "\n")
    .replace(/\t+/g, "\n")
    .replace(/[•·●◆▪︎]/g, "\n")
    .replace(/(教育经历|教育背景|工作经历|实习经历|项目经历|项目经验|技能证书|专业技能|证书奖项)/g, "\n$1\n")
    .replace(/(大学|学院|公司|集团|科技|银行|物流|零售|咨询)(\s*)/g, "$1$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const dateRangePattern = /\d{4}[./年-]\d{1,2}(?:月)?\s*[-—~至到]\s*(?:\d{4}[./年-]\d{1,2}(?:月)?|至今)/;

const isDateOnlyLine = (line: string) => {
  if (!dateRangePattern.test(line)) return false;
  return line.replace(dateRangePattern, "").replace(/[|｜\-—~至到年月./\s]/g, "").length <= 2;
};

const isDetailLine = (line: string) =>
  /^[\-–—*·•\s]*(负责|参与|主导|完成|协助|支持|输出|整理|跟进|优化|搭建|设计|分析|撰写|推进|维护|对接|调研|制定|执行|职责|成果|结果|描述)[:：]?\s*/.test(line);

const pickLine = (lines: string[], patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const line = lines.find((item) => pattern.test(item));
    if (line) return line.replace(pattern, "").trim();
  }

  return "";
};

const findEmail = (text: string) => text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
const findPhone = (text: string) => text.match(/(?:\+?86[- ]?)?1[3-9]\d{9}/)?.[0] ?? "";

const splitRecords = (text: string, keywords: RegExp) => {
  const lines = normalizeImportedText(text)
    .split(/\n+/)
    .map(clean)
    .filter(Boolean);
  const records: string[][] = [];
  let current: string[] = [];

  lines.forEach((line) => {
    const hasSectionKeyword = keywords.test(line);
    const currentHasRecordSignal = current.some((item) => keywords.test(item) || dateRangePattern.test(item));
    const looksLikeStart = hasSectionKeyword && !isDateOnlyLine(line) && !isDetailLine(line) && currentHasRecordSignal;
    if (looksLikeStart && current.length) {
      records.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  });

  if (current.length) records.push(current);
  return records.map((record) => record.join("\n")).filter((record) => record.length > 3);
};

const sectionText = (text: string, title: string, nextTitles: string[]) => {
  const match = text.match(new RegExp(title, "i"));
  if (!match || match.index === undefined) return "";
  const rest = text.slice(match.index + match[0].length);
  const nextPositions = nextTitles
    .map((item) => rest.search(new RegExp(item, "i")))
    .filter((position) => position >= 0);
  const end = nextPositions.length ? Math.min(...nextPositions) : rest.length;
  return clean(rest.slice(0, end));
};

const buildResumeFromText = (text: string): ResumeData => {
  const resume = defaultResumeData();
  const normalizedText = normalizeImportedText(text);
  const lines = normalizedText
    .split(/\n+/)
    .map(clean)
    .filter(Boolean);
  const firstMeaningfulLine = lines.find((line) => !findEmail(line) && !findPhone(line) && line.length <= 12);

  resume.personalInfo.name = pickLine(lines, [/^姓名[:：]?/]) || firstMeaningfulLine || "";
  resume.personalInfo.phone = findPhone(normalizedText);
  resume.personalInfo.email = findEmail(normalizedText);
  resume.personalInfo.city = pickLine(lines, [/^所在地[:：]?/, /^所在城市[:：]?/, /^城市[:：]?/]);
  resume.personalInfo.targetRole = pickLine(lines, [/^求职意向[:：]?/, /^目标岗位[:：]?/, /^应聘岗位[:：]?/]);

  const allTitles = ["教育经历", "教育背景", "工作经历", "实习经历", "项目经历", "项目经验", "技能证书", "专业技能", "证书奖项"];
  const education = sectionText(normalizedText, "教育经历|教育背景", allTitles.filter((item) => !["教育经历", "教育背景"].includes(item)));
  const experience = sectionText(normalizedText, "工作经历|实习经历", allTitles.filter((item) => !["工作经历", "实习经历"].includes(item)));
  const project = sectionText(normalizedText, "项目经历|项目经验", allTitles.filter((item) => !["项目经历", "项目经验"].includes(item)));
  const skills = sectionText(normalizedText, "技能证书|专业技能|证书奖项", allTitles.filter((item) => !["技能证书", "专业技能", "证书奖项"].includes(item)));

  resume.education = education
    ? splitRecords(education, /大学|学院|学校|本科|硕士|博士|大专/).map((record) => ({
        ...emptyEducation(),
        school: record.split(/\n| /).find((item) => /大学|学院|学校/.test(item)) ?? "",
        degree: record.match(/本科|硕士|博士|大专|学士|研究生/)?.[0] ?? "",
        major: pickLine(record.split(/\n+/).map(clean), [/^专业[:：]?/]) || (record.match(/[\u4e00-\u9fa5A-Za-z]+专业/)?.[0]?.replace("专业", "") ?? ""),
        startDate: record.match(/\d{4}[./年-]\d{1,2}/)?.[0] ?? "",
        endDate: record.match(/[-—~至到]\s*(\d{4}[./年-]\d{1,2}|至今)/)?.[1] ?? "",
        honors: record
      }))
    : [];

  resume.experiences = experience
    ? splitRecords(experience, /公司|集团|科技|咨询|银行|实习|产品|运营|分析|经理|助理/).map((record) => ({
        ...emptyExperience(),
        company: record.split(/\n| /).find((item) => /公司|集团|科技|咨询|银行|物流|零售/.test(item)) ?? "",
        role: record.match(/产品经理|解决方案|运营|分析师|实习生|助理|顾问/)?.[0] ?? "",
        startDate: record.match(/\d{4}[./年-]\d{1,2}/)?.[0] ?? "",
        endDate: record.match(/[-—~至到]\s*(\d{4}[./年-]\d{1,2}|至今)/)?.[1] ?? "",
        responsibilities: record
      }))
    : [];

  resume.projects = project
    ? splitRecords(project, /项目|平台|系统|方案|App|小程序|网站/).map((record) => ({
        ...emptyProject(),
        name: record.split(/\n+/).map(clean).find(Boolean) ?? "",
        startDate: record.match(/\d{4}[./年-]\d{1,2}/)?.[0] ?? "",
        endDate: record.match(/[-—~至到]\s*(\d{4}[./年-]\d{1,2}|至今)/)?.[1] ?? "",
        responsibilities: record
      }))
    : [];

  resume.skills = {
    keywords: skills || lines.filter((line) => /技能|熟悉|掌握|证书|CET|英语|SQL|Excel|Python|Java|产品|运营/.test(line)).join("\n"),
    languages: pickLine(lines, [/^语言能力[:：]?/]),
    tools: pickLine(lines, [/^工具能力[:：]?/]),
    certificates: pickLine(lines, [/^证书[:：]?/, /^证书奖项[:：]?/])
  };

  return resume;
};

const parsePdf = async (buffer: Buffer) => {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return data.text as string;
};

const parseDocx = async (buffer: Buffer) => {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请上传 PDF 或 Word 简历文件。" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    let text = "";

    if (fileName.endsWith(".pdf") || fileType.includes("pdf")) {
      text = await parsePdf(bytes);
    } else if (fileName.endsWith(".docx") || fileType.includes("wordprocessingml")) {
      text = await parseDocx(bytes);
    } else if (fileName.endsWith(".txt") || fileType.includes("text")) {
      text = decodeTextBuffer(bytes);
    } else {
      return NextResponse.json({ error: "当前支持 PDF、DOCX 和 TXT 文件。" }, { status: 400 });
    }

    const rawText = normalizeImportedText(text);
    const resume = buildResumeFromText(rawText);
    const qualityReport = buildImportQualityReport(resume);
    if (artifactScore(rawText) > 5) {
      qualityReport.warnings.unshift("检测到疑似乱码或编码异常，请在下方 Markdown 确认稿中人工修正后再生成画布。");
      qualityReport.confidence = "low";
    }
    return NextResponse.json({
      rawText,
      resume,
      qualityReport
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "简历导入失败" },
      { status: 500 }
    );
  }
}
