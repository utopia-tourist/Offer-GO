"use client";

import { Loader2, Sparkles } from "lucide-react";
import type { ResumeData } from "@/lib/types";

type AiWorkbenchProps = {
  resume: ResumeData;
  targetJob: string;
  jobDescription: string;
  loading: "analysis" | "diagnosis" | "suggestions" | null;
  error: string;
  aiConfigured: boolean;
  onTargetJobChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
  onDiagnose: () => void;
};

export function AiWorkbench({
  targetJob,
  jobDescription,
  loading,
  error,
  aiConfigured,
  onTargetJobChange,
  onJobDescriptionChange,
  onDiagnose
}: AiWorkbenchProps) {
  return (
    <aside className="no-print space-y-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto lg:pr-1">
      <section className="rounded-lg border border-line bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#e9efff] text-brand">
            <Sparkles className="h-4 w-4" />
          </span>
          <h2 className="text-base font-bold text-ink">AI 工作台</h2>
        </div>
        <div className={`mb-3 rounded-md border px-3 py-2 text-xs leading-5 ${aiConfigured ? "border-[#b7e0d2] bg-[#eef7f4] text-[#0d6b4d]" : "border-[#f3d6a2] bg-[#fff8eb] text-[#8a5a00]"}`}>
          {aiConfigured ? "大模型已配置，AI 将只输出诊断和建议，不会自动覆盖简历。" : "大模型尚未配置，请先设置服务端 .env.local。"}
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-[#344054]">目标岗位</span>
          <input
            className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            value={targetJob}
            onChange={(event) => onTargetJobChange(event.target.value)}
            placeholder="例如：解决方案产品经理"
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1.5 block text-xs font-semibold text-[#344054]">目标岗位 JD</span>
          <textarea
            className="min-h-32 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            value={jobDescription}
            onChange={(event) => onJobDescriptionChange(event.target.value)}
            placeholder="粘贴岗位职责、任职要求和加分项..."
          />
        </label>
        {error && <p className="mt-3 rounded-md border border-[#f2c8c8] bg-[#fff5f5] px-3 py-2 text-sm text-[#b42318]">{error}</p>}
        <div className="mt-3 grid grid-cols-1 gap-2">
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white disabled:opacity-60" onClick={onDiagnose} disabled={Boolean(loading)}>
            {loading === "diagnosis" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            简历诊断重构
          </button>
        </div>
      </section>
    </aside>
  );
}
