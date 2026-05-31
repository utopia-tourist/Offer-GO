"use client";

import { Mail, MapPin, Phone, Link as LinkIcon } from "lucide-react";
import type { ResumeData } from "@/lib/types";
import { dateRange, hasText } from "@/lib/resume";

type ResumePreviewProps = {
  resume: ResumeData;
  previewRef: React.RefObject<HTMLDivElement | null>;
  editable?: boolean;
};

const splitLines = (value: string) =>
  value
    .split(/\n|；|;/)
    .map((item) => item.trim())
    .filter(Boolean);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-5 first:mt-0">
    <div className="mb-2 flex items-center gap-3">
      <h2 className="text-[15px] font-bold text-ink">{title}</h2>
      <div className="h-px flex-1 bg-line" />
    </div>
    {children}
  </section>
);

const BulletList = ({ text }: { text: string }) => {
  const lines = splitLines(text);
  if (!lines.length) return null;

  return (
    <ul className="mt-1 space-y-1 text-[13px] leading-6 text-[#30394a]">
      {lines.map((line, index) => (
        <li key={`${line}-${index}`} className="flex gap-2">
          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#30394a]" />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
};

export function ResumePreview({ resume, previewRef, editable = false }: ResumePreviewProps) {
  const { personalInfo } = resume;
  const contactItems = [
    personalInfo.phone && { icon: Phone, text: personalInfo.phone },
    personalInfo.email && { icon: Mail, text: personalInfo.email },
    personalInfo.city && { icon: MapPin, text: personalInfo.city },
    personalInfo.link && { icon: LinkIcon, text: personalInfo.link }
  ].filter(Boolean) as { icon: typeof Phone; text: string }[];

  return (
    <div
      ref={previewRef}
      className={`resume-paper print-source mx-auto shadow-page ${editable ? "outline outline-2 outline-brand/40" : ""}`}
      contentEditable={editable}
      suppressContentEditableWarning
      spellCheck={false}
    >
      <div className="px-12 py-10">
        <header className="border-b border-line pb-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-normal text-ink">{personalInfo.name || "你的姓名"}</h1>
              <p className="mt-2 text-[15px] font-medium text-brand">
                {personalInfo.targetRole || "求职意向"}
              </p>
            </div>
          </div>
          {contactItems.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-muted">
              {contactItems.map((item) => {
                const Icon = item.icon;
                return (
                  <span key={item.text} className="inline-flex items-center gap-1.5">
                    <Icon aria-hidden className="h-3.5 w-3.5" />
                    {item.text}
                  </span>
                );
              })}
            </div>
          )}
        </header>

        {resume.education.some((item) => hasText(item.school, item.degree, item.major, item.gpa, item.courses, item.honors)) && (
          <Section title="教育经历">
            <div className="space-y-3">
              {resume.education
                .filter((item) => hasText(item.school, item.degree, item.major, item.gpa, item.courses, item.honors))
                .map((item) => (
                  <article key={item.id}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-[14px] font-bold text-ink">
                          {[item.school, item.degree, item.major].filter(Boolean).join(" / ")}
                        </h3>
                        {hasText(item.gpa, item.courses, item.honors) && (
                          <p className="mt-1 text-[12px] leading-5 text-muted">
                            {[item.gpa && `GPA：${item.gpa}`, item.courses && `相关课程：${item.courses}`, item.honors && `荣誉奖项：${item.honors}`]
                              .filter(Boolean)
                              .join("；")}
                          </p>
                        )}
                      </div>
                      <span className="text-[12px] text-muted">{dateRange(item.startDate, item.endDate)}</span>
                    </div>
                  </article>
                ))}
            </div>
          </Section>
        )}

        {resume.experiences.some((item) => hasText(item.company, item.role, item.responsibilities, item.achievements)) && (
          <Section title="工作/实习经历">
            <div className="space-y-4">
              {resume.experiences
                .filter((item) => hasText(item.company, item.role, item.responsibilities, item.achievements))
                .map((item) => (
                  <article key={item.id}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-[14px] font-bold text-ink">
                        {[item.company, item.role].filter(Boolean).join(" / ")}
                      </h3>
                      <span className="text-[12px] text-muted">{dateRange(item.startDate, item.endDate)}</span>
                    </div>
                    <BulletList text={[item.responsibilities, item.achievements].filter(Boolean).join("\n")} />
                  </article>
                ))}
            </div>
          </Section>
        )}

        {resume.projects.some((item) => hasText(item.name, item.role, item.background, item.responsibilities, item.results)) && (
          <Section title="项目经历">
            <div className="space-y-4">
              {resume.projects
                .filter((item) => hasText(item.name, item.role, item.background, item.responsibilities, item.results))
                .map((item) => (
                  <article key={item.id}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-[14px] font-bold text-ink">
                        {[item.name, item.role].filter(Boolean).join(" / ")}
                      </h3>
                      <span className="text-[12px] text-muted">{dateRange(item.startDate, item.endDate)}</span>
                    </div>
                    <BulletList text={[item.background, item.responsibilities, item.results].filter(Boolean).join("\n")} />
                  </article>
                ))}
            </div>
          </Section>
        )}

        {hasText(resume.skills.keywords, resume.skills.languages, resume.skills.tools, resume.skills.certificates) && (
          <Section title="技能证书">
            <div className="space-y-1 text-[13px] leading-6 text-[#30394a]">
              {resume.skills.keywords && <p><strong>技能关键词：</strong>{resume.skills.keywords}</p>}
              {resume.skills.languages && <p><strong>语言能力：</strong>{resume.skills.languages}</p>}
              {resume.skills.tools && <p><strong>工具能力：</strong>{resume.skills.tools}</p>}
              {resume.skills.certificates && <p><strong>证书奖项：</strong>{resume.skills.certificates}</p>}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
