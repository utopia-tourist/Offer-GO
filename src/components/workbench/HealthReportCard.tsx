"use client";

import type { ResumeHealthReport } from "@/lib/types";

type HealthReportCardProps = {
  report: ResumeHealthReport | null;
};

const Score = ({ label, value }: { label: string; value?: number }) => (
  <div className="rounded-md border border-line bg-paper px-3 py-2">
    <p className="text-xs text-muted">{label}</p>
    <p className="mt-1 text-2xl font-bold text-ink">{typeof value === "number" ? value : "--"}</p>
  </div>
);

export function HealthReportCard({ report }: HealthReportCardProps) {
  if (!report) {
    return (
      <section className="rounded-lg border border-line bg-white p-4">
        <h2 className="text-base font-bold text-ink">简历体检报告</h2>
        <p className="mt-2 rounded-md border border-dashed border-line bg-paper px-3 py-2 text-xs leading-5 text-muted">
          点击“生成体检报告”后展示完整度、专业度、量化程度和优先优化模块。
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-line bg-white p-4">
      <h2 className="text-base font-bold text-ink">简历体检报告</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Score label="完整度" value={report.completenessScore} />
        <Score label="专业度" value={report.professionalScore} />
        <Score label="量化程度" value={report.quantificationScore} />
        <Score label="JD 匹配" value={report.jdMatchScore} />
      </div>
      <div className="mt-3 space-y-2">
        {report.majorIssues.map((issue) => (
          <p key={issue} className="rounded-md bg-[#fff8eb] px-3 py-2 text-xs leading-5 text-[#8a5a00]">{issue}</p>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {report.prioritySections.map((section) => (
          <span key={section} className="rounded-md bg-[#e9efff] px-2 py-1 text-xs font-semibold text-brand">{section}</span>
        ))}
      </div>
    </section>
  );
}
