"use client";

import { AlertTriangle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { emptyEducation, emptyExperience, emptyProject } from "@/lib/resume";
import type { Education, Experience, ImportQualityReport, Project, ResumeData } from "@/lib/types";

type ImportQualityReviewProps = {
  report: ImportQualityReport;
  resume: ResumeData;
  onResumeChange: (resume: ResumeData) => void;
  onConfirm: () => void;
  onFix: () => void;
};

export function ImportQualityReview({ report, resume, onResumeChange, onConfirm, onFix }: ImportQualityReviewProps) {
  const confident = report.confidence === "high";
  const updateResume = (next: Partial<ResumeData>) => onResumeChange({ ...resume, ...next });
  const updateEducation = (index: number, value: Education) => updateResume({
    education: resume.education.map((item, itemIndex) => itemIndex === index ? value : item)
  });
  const updateExperience = (index: number, value: Experience) => updateResume({
    experiences: resume.experiences.map((item, itemIndex) => itemIndex === index ? value : item)
  });
  const updateProject = (index: number, value: Project) => updateResume({
    projects: resume.projects.map((item, itemIndex) => itemIndex === index ? value : item)
  });
  const removeArrayItem = (key: "education" | "experiences" | "projects", index: number) => {
    updateResume({ [key]: resume[key].filter((_, itemIndex) => itemIndex !== index) } as Partial<ResumeData>);
  };

  return (
    <div className="no-print rounded-lg border border-line bg-white p-4 shadow-page">
      <div className="mb-3 flex items-start gap-3">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${confident ? "bg-[#eef7f4] text-success" : "bg-[#fff8eb] text-warning"}`}>
          {confident ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        </span>
        <div>
          <h2 className="text-base font-bold text-ink">导入质量检查</h2>
          <p className="mt-1 text-sm text-muted">请先逐项检查解析结果。乱码、漏识别或串行内容可以直接在小框里修正，确认后再生成简历画布。</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm lg:grid-cols-3">
        <QualityItem label="个人信息" value={report.personalInfo === "recognized" ? "已识别" : "未识别"} />
        <QualityItem label="教育经历" value={`${report.educationCount} 段`} />
        <QualityItem label="工作/实习经历" value={`${report.experienceCount} 段`} />
        <QualityItem label="项目经历" value={`${report.projectCount} 段`} />
        <QualityItem label="技能证书" value={report.skillsRecognized ? "已识别" : "未识别"} />
        <QualityItem label="置信度" value={report.confidence === "high" ? "高" : report.confidence === "medium" ? "中" : "低"} />
      </div>
      {report.warnings.length > 0 && (
        <ul className="mt-3 space-y-2">
          {report.warnings.map((warning) => (
            <li key={warning} className="rounded-md bg-[#fff8eb] px-3 py-2 text-xs leading-5 text-[#8a5a00]">
              {warning}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 space-y-3">
        <ModuleCard title="个人信息" description="确认基础联系方式和求职意向。">
          <div className="grid gap-2 md:grid-cols-3">
            <TextField label="姓名" value={resume.personalInfo.name} onChange={(name) => updateResume({ personalInfo: { ...resume.personalInfo, name } })} />
            <TextField label="手机号" value={resume.personalInfo.phone} onChange={(phone) => updateResume({ personalInfo: { ...resume.personalInfo, phone } })} />
            <TextField label="邮箱" value={resume.personalInfo.email} onChange={(email) => updateResume({ personalInfo: { ...resume.personalInfo, email } })} />
            <TextField label="所在城市" value={resume.personalInfo.city} onChange={(city) => updateResume({ personalInfo: { ...resume.personalInfo, city } })} />
            <TextField label="求职意向" value={resume.personalInfo.targetRole} onChange={(targetRole) => updateResume({ personalInfo: { ...resume.personalInfo, targetRole } })} />
            <TextField label="个人链接" value={resume.personalInfo.link} onChange={(link) => updateResume({ personalInfo: { ...resume.personalInfo, link } })} />
          </div>
        </ModuleCard>

        <ModuleCard
          title="教育经历"
          description="每一段教育经历单独成卡片，可添加本科、硕士等多段背景。"
          action={<AddButton label="添加教育经历" onClick={() => updateResume({ education: [...resume.education, emptyEducation()] })} />}
        >
          <div className="space-y-3">
            {resume.education.map((item, index) => (
              <RecordCard key={item.id} title={`教育经历 ${index + 1}`} onRemove={() => removeArrayItem("education", index)}>
                <EducationFields item={item} onChange={(next) => updateEducation(index, next)} />
              </RecordCard>
            ))}
          </div>
        </ModuleCard>

        <ModuleCard
          title="工作/实习经历"
          description="每家公司或实习单独成卡片，方便检查是否漏掉某段经历。"
          action={<AddButton label="添加工作/实习经历" onClick={() => updateResume({ experiences: [...resume.experiences, emptyExperience()] })} />}
        >
          <div className="space-y-3">
            {resume.experiences.map((item, index) => (
              <RecordCard key={item.id} title={`工作/实习经历 ${index + 1}`} onRemove={() => removeArrayItem("experiences", index)}>
                <ExperienceFields item={item} onChange={(next) => updateExperience(index, next)} />
              </RecordCard>
            ))}
          </div>
        </ModuleCard>

        <ModuleCard
          title="项目经历"
          description="每个项目单独成卡片，至少确认项目名称、起止时间和项目内容。"
          action={<AddButton label="添加项目经历" onClick={() => updateResume({ projects: [...resume.projects, emptyProject()] })} />}
        >
          <div className="space-y-3">
            {resume.projects.map((item, index) => (
              <RecordCard key={item.id} title={`项目经历 ${index + 1}`} onRemove={() => removeArrayItem("projects", index)}>
                <ProjectFields item={item} onChange={(next) => updateProject(index, next)} />
              </RecordCard>
            ))}
          </div>
        </ModuleCard>

        <ModuleCard title="技能证书" description="补齐关键词、工具、语言能力和证书奖项。">
          <div className="grid gap-2 md:grid-cols-2">
            <TextAreaField label="技能关键词" value={resume.skills.keywords} onChange={(keywords) => updateResume({ skills: { ...resume.skills, keywords } })} />
            <TextAreaField label="工具能力" value={resume.skills.tools} onChange={(tools) => updateResume({ skills: { ...resume.skills, tools } })} />
            <TextField label="语言能力" value={resume.skills.languages} onChange={(languages) => updateResume({ skills: { ...resume.skills, languages } })} />
            <TextField label="证书奖项" value={resume.skills.certificates} onChange={(certificates) => updateResume({ skills: { ...resume.skills, certificates } })} />
          </div>
        </ModuleCard>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white" onClick={onConfirm}>
          确认无误，生成画布并开始 AI 诊断
        </button>
        <button type="button" className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink" onClick={onFix}>
          先生成画布，稍后再诊断
        </button>
      </div>
    </div>
  );
}

const QualityItem = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-line bg-paper px-3 py-2">
    <p className="text-xs text-muted">{label}</p>
    <p className="mt-1 font-semibold text-ink">{value}</p>
  </div>
);

const ModuleCard = ({
  title,
  description,
  action,
  children
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className="rounded-md border border-line bg-paper p-3">
    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
      <div>
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const RecordCard = ({ title, children, onRemove }: { title: string; children: ReactNode; onRemove: () => void }) => (
  <article className="rounded-md border border-line bg-white p-3">
    <div className="mb-3 flex items-center justify-between gap-2">
      <h4 className="text-sm font-semibold text-ink">{title}</h4>
      <button type="button" className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[#b42318] hover:bg-[#fff5f5]" onClick={onRemove}>
        <Trash2 className="h-3.5 w-3.5" />
        删除
      </button>
    </div>
    {children}
  </article>
);

const AddButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-2 text-xs font-bold text-ink hover:border-brand hover:text-brand" onClick={onClick}>
    <Plus className="h-3.5 w-3.5" />
    {label}
  </button>
);

const TextField = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
    <input
      className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);

const TextAreaField = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
    <textarea
      className="min-h-24 w-full rounded-md border border-line bg-white px-3 py-2 text-sm leading-6 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);

const EducationFields = ({ item, onChange }: { item: Education; onChange: (item: Education) => void }) => (
  <div className="grid gap-2 md:grid-cols-4">
    <TextField label="学校" value={item.school} onChange={(school) => onChange({ ...item, school })} />
    <TextField label="学历" value={item.degree} onChange={(degree) => onChange({ ...item, degree })} />
    <TextField label="专业" value={item.major} onChange={(major) => onChange({ ...item, major })} />
    <TextField label="GPA" value={item.gpa} onChange={(gpa) => onChange({ ...item, gpa })} />
    <TextField label="开始时间" value={item.startDate} onChange={(startDate) => onChange({ ...item, startDate })} />
    <TextField label="结束时间" value={item.endDate} onChange={(endDate) => onChange({ ...item, endDate })} />
    <div className="md:col-span-2">
      <TextField label="相关课程" value={item.courses} onChange={(courses) => onChange({ ...item, courses })} />
    </div>
    <div className="md:col-span-4">
      <TextAreaField label="荣誉奖项 / 补充说明" value={item.honors} onChange={(honors) => onChange({ ...item, honors })} />
    </div>
  </div>
);

const ExperienceFields = ({ item, onChange }: { item: Experience; onChange: (item: Experience) => void }) => (
  <div className="grid gap-2 md:grid-cols-4">
    <div className="md:col-span-2">
      <TextField label="公司 / 组织" value={item.company} onChange={(company) => onChange({ ...item, company })} />
    </div>
    <TextField label="职位" value={item.role} onChange={(role) => onChange({ ...item, role })} />
    <div className="grid grid-cols-2 gap-2">
      <TextField label="开始时间" value={item.startDate} onChange={(startDate) => onChange({ ...item, startDate })} />
      <TextField label="结束时间" value={item.endDate} onChange={(endDate) => onChange({ ...item, endDate })} />
    </div>
    <div className="md:col-span-2">
      <TextAreaField label="工作内容" value={item.responsibilities} onChange={(responsibilities) => onChange({ ...item, responsibilities })} />
    </div>
    <div className="md:col-span-2">
      <TextAreaField label="工作成果" value={item.achievements} onChange={(achievements) => onChange({ ...item, achievements })} />
    </div>
  </div>
);

const ProjectFields = ({ item, onChange }: { item: Project; onChange: (item: Project) => void }) => (
  <div className="grid gap-2 md:grid-cols-4">
    <div className="md:col-span-2">
      <TextField label="项目名称" value={item.name} onChange={(name) => onChange({ ...item, name })} />
    </div>
    <TextField label="项目角色" value={item.role} onChange={(role) => onChange({ ...item, role })} />
    <div className="grid grid-cols-2 gap-2">
      <TextField label="开始时间" value={item.startDate} onChange={(startDate) => onChange({ ...item, startDate })} />
      <TextField label="结束时间" value={item.endDate} onChange={(endDate) => onChange({ ...item, endDate })} />
    </div>
    <div className="md:col-span-2">
      <TextAreaField label="项目内容 / 负责内容" value={item.responsibilities} onChange={(responsibilities) => onChange({ ...item, responsibilities })} />
    </div>
    <TextAreaField label="项目背景" value={item.background} onChange={(background) => onChange({ ...item, background })} />
    <TextAreaField label="项目成果" value={item.results} onChange={(results) => onChange({ ...item, results })} />
  </div>
);
