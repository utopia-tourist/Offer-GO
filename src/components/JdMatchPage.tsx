"use client";

import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { resumeToPlainText } from "@/lib/resume";
import type { JdMatchReport, OptimizeResumeResult, ResumeData, ResumeOptimizationState } from "@/lib/types";
import {
  JD_MATCH_INPUT_STORAGE_KEY,
  JD_MATCH_REPORT_STORAGE_KEY,
  OPTIMIZED_RESUME_MARKDOWN_STORAGE_KEY,
  RESUME_OPTIMIZATION_STATE_STORAGE_KEY
} from "@/lib/workflow-storage";

type JdMatchInput = {
  resume: ResumeData;
  targetJob: string;
  jobDescription: string;
};

const dimensionLabels: Array<[keyof JdMatchReport["dimensions"], string, string]> = [
  ["skillMatch", "技能匹配", "bg-[#3b82f6]"],
  ["experienceMatch", "经验匹配", "bg-[#0f9f6e]"],
  ["projectFit", "项目贴合", "bg-[#60a5fa]"],
  ["contentQuality", "内容规范", "bg-[#10b981]"]
];

export function JdMatchPage() {
  const router = useRouter();
  const [input, setInput] = useState<JdMatchInput | null>(null);
  const [report, setReport] = useState<JdMatchReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const rawInput = localStorage.getItem(JD_MATCH_INPUT_STORAGE_KEY);
    if (!rawInput) {
      setError("未找到本次 JD 匹配输入，请回到简历优化页面重新发起诊断。");
      setLoading(false);
      return;
    }

    try {
      const parsedInput = JSON.parse(rawInput) as JdMatchInput;
      setInput(parsedInput);
      const cached = localStorage.getItem(JD_MATCH_REPORT_STORAGE_KEY);
      if (cached) {
        const cachedReport = JSON.parse(cached) as JdMatchReport;
        setReport(cachedReport);
        setLoading(false);
        return;
      }
      void runDiagnosis(parsedInput);
    } catch {
      setError("JD 匹配输入读取失败，请回到简历优化页面重新发起诊断。");
      setLoading(false);
    }
  }, []);

  const runDiagnosis = async (payload: JdMatchInput) => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/ai/diagnose-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: payload.resume,
          jobDescription: payload.jobDescription
        })
      });
      const result = (await response.json()) as JdMatchReport & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "JD 匹配诊断失败");
      setReport(result);
      localStorage.setItem(JD_MATCH_REPORT_STORAGE_KEY, JSON.stringify(result));
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "JD 匹配诊断失败");
    } finally {
      setLoading(false);
    }
  };

  const titleMeta = useMemo(() => {
    if (!input) return "等待输入";
    const resumeName = input.resume.personalInfo.name || "当前简历";
    return `${resumeName}${input.targetJob ? `，${input.targetJob}` : ""}`;
  }, [input]);

  const goOptimization = async () => {
    if (!input || !report) return;

    try {
      setOptimizing(true);
      setError("");
      const response = await fetch("/api/ai/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: input.resume,
          targetJob: input.targetJob,
          jobDescription: input.jobDescription,
          jdMatchReport: report
        })
      });
      const result = (await response.json()) as OptimizeResumeResult & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "生成优化结果失败");

      const state: ResumeOptimizationState = {
        originalResumeMarkdown: resumeToPlainText(input.resume),
        jdMatchReport: report,
        optimizedResumeMarkdown: result.optimizedResumeMarkdown,
        updatedAt: result.updatedAt
      };
      localStorage.setItem(RESUME_OPTIMIZATION_STATE_STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(OPTIMIZED_RESUME_MARKDOWN_STORAGE_KEY, result.optimizedResumeMarkdown);
      window.dispatchEvent(new Event("resume-result-updated"));
      router.push("/optimization-result");
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "生成优化结果失败");
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted hover:border-brand hover:text-brand"
              onClick={() => router.push("/")}
              aria-label="返回简历优化"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold">简历优化</h1>
              <p className="mt-1 text-xs text-muted">诊断报告　本次：{titleMeta}</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <AppNav active="jd-match" />
            <button type="button" className="text-sm font-semibold text-muted hover:text-brand" onClick={() => router.push("/")}>
              修改输入
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {loading && (
          <div className="flex min-h-80 items-center justify-center rounded-lg border border-line bg-paper">
            <div className="text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand" />
              <p className="mt-3 text-sm text-muted">正在生成 JD 匹配诊断报告...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-[#f2c8c8] bg-[#fff5f5] p-5 text-sm text-[#b42318]">
            {error}
            <button type="button" className="ml-3 font-bold underline" onClick={() => router.push("/")}>
              回到简历优化
            </button>
          </div>
        )}

        {report && !loading && (
          <article className="space-y-8">
            <section>
              <h2 className="mb-5 text-base font-bold">1. 候选人画像</h2>
              <div className="rounded-lg border border-line bg-white p-6 shadow-sm">
                <div className="grid gap-5 md:grid-cols-[72px_1fr]">
                  <div className="text-center">
                    <p className="text-2xl font-black text-[#00856f]">{report.totalScore}</p>
                    <p className="mt-1 text-xs text-muted">匹配评分 / 100</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-6 text-ink">{report.candidateSummary}</p>
                    <div className="mt-5 space-y-3">
                      {dimensionLabels.map(([key, label, color]) => (
                        <ProgressRow key={key} label={label} score={report.dimensions[key]} color={color} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <ReportList title="✨ 简历亮点 Highlights" items={report.highlights} color="text-[#c2410c]" />
            <ReportList title="2. 潜在不足与 Gap 分析" items={report.gaps} />
            <ReportList title="3. 架构建议" items={report.structureAdvice} ordered />

            <section>
              <h2 className="mb-3 text-base font-bold">4. ATS 关键词</h2>
              <div className="flex flex-wrap gap-2">
                {report.atsKeywords.map((keyword) => (
                  <span key={keyword} className="rounded-full border border-line bg-paper px-3 py-1 text-sm text-ink">
                    {keyword}
                  </span>
                ))}
              </div>
            </section>

            <section className="border-t border-line pt-8 text-center">
              {error && (
                <p className="mx-auto mb-4 max-w-xl rounded-md border border-[#f2c8c8] bg-[#fff5f5] px-3 py-2 text-sm text-[#b42318]">
                  {error}
                </p>
              )}
              <div className="mb-4">
                <button
                  type="button"
                  className="text-sm font-semibold text-muted hover:text-brand disabled:opacity-60"
                  onClick={goOptimization}
                  disabled={optimizing}
                >
                  {optimizing ? "正在生成优化结果..." : "下一步"}
                </button>
              </div>
              <button
                type="button"
                className="mx-auto inline-flex min-w-64 flex-col items-center justify-center rounded-lg bg-[#17181c] px-8 py-5 text-white shadow-sm hover:bg-black disabled:opacity-70"
                onClick={goOptimization}
                disabled={optimizing}
              >
                {optimizing ? <Loader2 className="mb-2 h-5 w-5 animate-spin" /> : <Sparkles className="mb-2 h-5 w-5" />}
                <span className="text-sm font-bold">{optimizing ? "正在生成优化结果" : "查看优化结果"}</span>
                <span className="mt-2 text-xs text-white/70">基于诊断报告生成完整优化简历</span>
              </button>
            </section>
          </article>
        )}
      </div>
    </main>
  );
}

const ProgressRow = ({ label, score, color }: { label: string; score: number; color: string }) => (
  <div className="grid grid-cols-[72px_1fr_40px] items-center gap-3 text-sm">
    <span className="text-muted">{label}</span>
    <div className="h-2 overflow-hidden rounded-full bg-[#f1f5f9]">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
    </div>
    <span className="text-right text-xs font-bold text-brand">{score}%</span>
  </div>
);

const ReportList = ({
  title,
  items,
  ordered = false,
  color = "text-ink"
}: {
  title: string;
  items: string[];
  ordered?: boolean;
  color?: string;
}) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <section>
      <h2 className={`mb-3 text-base font-bold ${color}`}>{title}</h2>
      <Tag className={`space-y-2 text-sm leading-7 text-ink ${ordered ? "list-decimal pl-5" : "list-disc pl-5"}`}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </Tag>
    </section>
  );
};
