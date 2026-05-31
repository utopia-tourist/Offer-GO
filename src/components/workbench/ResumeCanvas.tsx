"use client";

import { Link as LinkIcon, Mail, MapPin, Phone } from "lucide-react";
import { CanvasBlockView } from "@/components/workbench/CanvasBlock";
import { dateRange, getResumeStyle, hasText, resumeToCanvasBlocks } from "@/lib/resume";
import type { CanvasBlock, CanvasHighlight, ResumeData } from "@/lib/types";

type ResumeCanvasProps = {
  resume: ResumeData;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  selectedBlockId?: string;
  highlights: CanvasHighlight[];
  onSelectBlock: (block: CanvasBlock) => void;
};

const splitLines = (value: string) =>
  Array.from(new Map(value
    .split(/\n|；|;/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => [
      item
        .replace(/[，。；：、,.；;:]/g, "")
        .replace(/\s+/g, "")
        .toLowerCase(),
      item
    ])).values());

const fontFamilyMap = {
  system: 'Arial, "Microsoft YaHei", "PingFang SC", sans-serif',
  sans: '"Microsoft YaHei", "PingFang SC", Arial, sans-serif',
  serif: '"SimSun", "Songti SC", "Times New Roman", serif'
};

const Section = ({ title, spacing, children }: { title: string; spacing: number; children: React.ReactNode }) => (
  <section className="first:mt-0" style={{ marginTop: spacing }}>
    <div className="resume-section-title mb-2 flex items-center gap-3">
      <h2 className="text-[15px] font-bold text-ink">{title}</h2>
    </div>
    {children}
  </section>
);

export function ResumeCanvas({ resume, canvasRef, selectedBlockId, highlights, onSelectBlock }: ResumeCanvasProps) {
  const blocks = resumeToCanvasBlocks(resume);
  const resumeStyle = getResumeStyle(resume);
  const canvasStyle = {
    "--resume-font-size": `${resumeStyle.fontSize}px`,
    "--resume-line-height": String(resumeStyle.lineHeight),
    "--resume-paragraph-spacing": `${resumeStyle.paragraphSpacing}px`,
    fontFamily: fontFamilyMap[resumeStyle.fontFamily]
  } as React.CSSProperties;
  const block = (path: string) => blocks.find((item) => item.path === path);
  const highlightFor = (id: string) => highlights.find((item) => item.blockId === id);
  const renderBlock = (path: string, children: React.ReactNode, className = "") => {
    const target = block(path);
    if (!target) return children;

    return (
      <CanvasBlockView
        block={target}
        highlight={highlightFor(target.id)}
        className={`${selectedBlockId === target.id ? "ring-2 ring-brand/45" : ""} ${className}`}
        onSelect={onSelectBlock}
      >
        {children}
      </CanvasBlockView>
    );
  };

  const contactItems = [
    resume.personalInfo.phone && { icon: Phone, path: "personalInfo.phone", text: resume.personalInfo.phone },
    resume.personalInfo.email && { icon: Mail, path: "personalInfo.email", text: resume.personalInfo.email },
    resume.personalInfo.city && { icon: MapPin, path: "personalInfo.city", text: resume.personalInfo.city },
    resume.personalInfo.link && { icon: LinkIcon, path: "personalInfo.link", text: resume.personalInfo.link }
  ].filter(Boolean) as { icon: typeof Phone; path: string; text: string }[];

  return (
    <div id="resume-print-area" ref={canvasRef} className="resume-paper resume-print-area print-source mx-auto shadow-page" style={canvasStyle}>
      <div className="px-12 py-10">
        <header className="border-b border-line pb-5">
          <div>
            {renderBlock("personalInfo.name", <h1 className="text-3xl font-bold tracking-normal text-ink">{resume.personalInfo.name || "你的姓名"}</h1>)}
            {renderBlock("personalInfo.targetRole", <p className="mt-2 text-[15px] font-medium text-brand">{resume.personalInfo.targetRole || "求职意向"}</p>)}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 text-muted sm:grid-cols-2" data-resume-text="small">
            {contactItems.map((item) => {
              const Icon = item.icon;
              return renderBlock(
                item.path,
                <span className="inline-flex items-center gap-1.5">
                  <Icon aria-hidden className="h-3.5 w-3.5" />
                  {item.text}
                </span>,
                "w-full"
              );
            })}
          </div>
        </header>

        {resume.education.some((item) => hasText(item.school, item.degree, item.major, item.gpa, item.courses, item.honors)) && (
          <Section title="教育经历" spacing={resumeStyle.paragraphSpacing}>
            <div className="space-y-3">
              {resume.education.map((item, index) => (
                <article key={item.id} className="resume-item">
                  <div className="resume-item-header">
                    <div className="resume-item-title">
                      <h3 className="text-[14px] font-bold text-ink">
                        {renderBlock(`education.${index}.school`, <span>{[item.school, item.degree, item.major].filter(Boolean).join(" / ") || "学校 / 学历 / 专业"}</span>)}
                      </h3>
                      {hasText(item.gpa, item.courses, item.honors) && (
                        <div className="mt-1 text-muted" data-resume-text="small">
                          {item.gpa && renderBlock(`education.${index}.gpa`, <p>GPA：{item.gpa}</p>)}
                          {item.courses && renderBlock(`education.${index}.courses`, <p>相关课程：{item.courses}</p>)}
                          {item.honors && renderBlock(`education.${index}.honors`, <p>荣誉奖项：{item.honors}</p>)}
                        </div>
                      )}
                    </div>
                    {renderBlock(`education.${index}.startDate`, <span className="resume-item-date text-muted" data-resume-text="small">{dateRange(item.startDate, item.endDate)}</span>)}
                  </div>
                </article>
              ))}
            </div>
          </Section>
        )}

        {resume.experiences.some((item) => hasText(item.company, item.role, item.responsibilities, item.achievements)) && (
          <Section title="工作/实习经历" spacing={resumeStyle.paragraphSpacing}>
            <div className="space-y-4">
              {resume.experiences.map((item, index) => (
                <article key={item.id} className="resume-item">
                  <div className="resume-item-header">
                    <h3 className="resume-item-title text-[14px] font-bold text-ink">
                      {renderBlock(`experiences.${index}.company`, <span>{[item.company, item.role].filter(Boolean).join(" / ") || "公司 / 职位"}</span>)}
                    </h3>
                    {renderBlock(`experiences.${index}.startDate`, <span className="resume-item-date text-muted" data-resume-text="small">{dateRange(item.startDate, item.endDate)}</span>)}
                  </div>
                  <ul className="mt-1 space-y-1 text-[#30394a]" data-resume-text="body">
                    {splitLines([item.responsibilities, item.achievements].filter(Boolean).join("\n")).map((line, lineIndex) => (
                      <li key={`${item.id}-${lineIndex}`} className="flex min-w-0 gap-2">
                        <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#30394a]" />
                        {renderBlock(lineIndex === 0 ? `experiences.${index}.responsibilities` : `experiences.${index}.achievements`, <span>{line}</span>)}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Section>
        )}

        {resume.projects.some((item) => hasText(item.name, item.role, item.background, item.responsibilities, item.results)) && (
          <Section title="项目经历" spacing={resumeStyle.paragraphSpacing}>
            <div className="space-y-4">
              {resume.projects.map((item, index) => (
                <article key={item.id} className="resume-item">
                  <div className="resume-item-header">
                    <h3 className="resume-item-title text-[14px] font-bold text-ink">
                      {renderBlock(`projects.${index}.name`, <span>{[item.name, item.role].filter(Boolean).join(" / ") || "项目 / 角色"}</span>)}
                    </h3>
                    {renderBlock(`projects.${index}.startDate`, <span className="resume-item-date text-muted" data-resume-text="small">{dateRange(item.startDate, item.endDate)}</span>)}
                  </div>
                  <ul className="mt-1 space-y-1 text-[#30394a]" data-resume-text="body">
                    {splitLines([item.background, item.responsibilities, item.results].filter(Boolean).join("\n")).map((line, lineIndex) => (
                      <li key={`${item.id}-${lineIndex}`} className="flex min-w-0 gap-2">
                        <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#30394a]" />
                        {renderBlock(
                          lineIndex === 0 ? `projects.${index}.background` : lineIndex === 1 ? `projects.${index}.responsibilities` : `projects.${index}.results`,
                          <span>{line}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Section>
        )}

        {hasText(resume.skills.keywords, resume.skills.languages, resume.skills.tools, resume.skills.certificates) && (
          <Section title="技能证书" spacing={resumeStyle.paragraphSpacing}>
            <div className="space-y-1 text-[#30394a]" data-resume-text="body">
              {resume.skills.keywords && renderBlock("skills.keywords", <p><strong>技能关键词：</strong>{resume.skills.keywords}</p>)}
              {resume.skills.languages && renderBlock("skills.languages", <p><strong>语言能力：</strong>{resume.skills.languages}</p>)}
              {resume.skills.tools && renderBlock("skills.tools", <p><strong>工具能力：</strong>{resume.skills.tools}</p>)}
              {resume.skills.certificates && renderBlock("skills.certificates", <p><strong>证书奖项：</strong>{resume.skills.certificates}</p>)}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
