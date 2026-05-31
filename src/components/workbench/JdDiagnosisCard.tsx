"use client";

import type { DiagnoseResult } from "@/lib/types";

type JdDiagnosisCardProps = {
  result: DiagnoseResult | null;
};

const asTextList = (items: DiagnoseResult["suggestions"] | string[]) =>
  (items as unknown[]).map((item) => (typeof item === "string" ? item : ("locationLabel" in (item as Record<string, unknown>) ? String((item as Record<string, unknown>).locationLabel) : ""))).filter(Boolean);

export function JdDiagnosisCard({ result }: JdDiagnosisCardProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-4">
      <h2 className="text-base font-bold text-ink">JD 匹配诊断</h2>
      {!result ? (
        <p className="mt-2 rounded-md border border-dashed border-line bg-paper px-3 py-2 text-xs leading-5 text-muted">
          输入目标岗位和 JD 后生成匹配度、覆盖能力、缺失能力和建议关键词。
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-md bg-[#eef7f4] p-3">
            <p className="text-xs text-muted">匹配度分数</p>
            <p className="mt-1 text-3xl font-bold text-success">{result.score}</p>
          </div>
          <List title="已覆盖能力点" items={result.coveredSkills} />
          <List title="缺失能力点" items={result.missingSkills} />
          <List title="建议补充关键词" items={result.keywords} />
          <List title="需要强化模块" items={result.weakSections} />
          <List title="建议摘要" items={asTextList(result.suggestions)} />
        </div>
      )}
    </section>
  );
}

const List = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <h3 className="mb-1 text-xs font-bold text-ink">{title}</h3>
    {items.length ? (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={`${title}-${item}`} className="rounded-md border border-line bg-paper px-2 py-1 text-xs text-[#30394a]">{item}</span>
        ))}
      </div>
    ) : (
      <p className="text-xs text-muted">暂无</p>
    )}
  </div>
);
