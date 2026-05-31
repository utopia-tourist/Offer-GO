"use client";

import { ArrowLeft, Clipboard, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { applyOptimizedMarkdownToResume, resumeToPlainText } from "@/lib/resume";
import type { JdMatchReport, OptimizeResumeResult, ResumeData, ResumeOptimizationState } from "@/lib/types";
import {
  JD_MATCH_INPUT_STORAGE_KEY,
  JD_MATCH_REPORT_STORAGE_KEY,
  OPTIMIZED_RESUME_MARKDOWN_STORAGE_KEY,
  RESUME_OPTIMIZATION_STATE_STORAGE_KEY,
  RESUME_STORAGE_KEY,
  RESUME_TOAST_STORAGE_KEY
} from "@/lib/workflow-storage";

type MatchInput = {
  resume: ResumeData;
  targetJob: string;
  jobDescription: string;
};

export function OptimizationResultPage() {
  const router = useRouter();
  const [input, setInput] = useState<MatchInput | null>(null);
  const [state, setState] = useState<ResumeOptimizationState | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const inputRaw = localStorage.getItem(JD_MATCH_INPUT_STORAGE_KEY);
    const stateRaw = localStorage.getItem(RESUME_OPTIMIZATION_STATE_STORAGE_KEY);
    const reportRaw = localStorage.getItem(JD_MATCH_REPORT_STORAGE_KEY);
    const fallbackMarkdown = localStorage.getItem(OPTIMIZED_RESUME_MARKDOWN_STORAGE_KEY) ?? "";

    try {
      const parsedInput = inputRaw ? JSON.parse(inputRaw) as MatchInput : null;
      setInput(parsedInput);

      if (stateRaw) {
        const parsedState = JSON.parse(stateRaw) as ResumeOptimizationState;
        setState(parsedState);
        setMarkdown(parsedState.optimizedResumeMarkdown);
        return;
      }

      if (parsedInput && reportRaw && fallbackMarkdown) {
        const fallbackState: ResumeOptimizationState = {
          originalResumeMarkdown: resumeToPlainText(parsedInput.resume),
          jdMatchReport: JSON.parse(reportRaw) as JdMatchReport,
          optimizedResumeMarkdown: fallbackMarkdown,
          updatedAt: new Date().toISOString()
        };
        setState(fallbackState);
        setMarkdown(fallbackMarkdown);
        localStorage.setItem(RESUME_OPTIMIZATION_STATE_STORAGE_KEY, JSON.stringify(fallbackState));
        return;
      }

      setError("未找到完整优化结果，请回到 JD 匹配诊断页重新生成。");
    } catch {
      setError("优化结果读取失败，请回到 JD 匹配诊断页重新生成。");
    }
  }, []);

  const saveState = (next: ResumeOptimizationState) => {
    setState(next);
    setMarkdown(next.optimizedResumeMarkdown);
    localStorage.setItem(RESUME_OPTIMIZATION_STATE_STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(OPTIMIZED_RESUME_MARKDOWN_STORAGE_KEY, next.optimizedResumeMarkdown);
    window.dispatchEvent(new Event("resume-result-updated"));
  };

  const regenerate = async () => {
    if (!input || !state?.jdMatchReport) {
      setError("缺少原始简历或 JD 匹配报告，无法重新生成。");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/ai/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: input.resume,
          targetJob: input.targetJob,
          jobDescription: input.jobDescription,
          jdMatchReport: state.jdMatchReport
        })
      });
      const result = (await response.json()) as OptimizeResumeResult & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "重新生成优化结果失败");
      saveState({
        originalResumeMarkdown: resumeToPlainText(input.resume),
        jdMatchReport: state.jdMatchReport,
        optimizedResumeMarkdown: result.optimizedResumeMarkdown,
        updatedAt: result.updatedAt
      });
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "重新生成优化结果失败");
    } finally {
      setLoading(false);
    }
  };

  const updateMarkdown = (value: string) => {
    setMarkdown(value);
    localStorage.setItem(OPTIMIZED_RESUME_MARKDOWN_STORAGE_KEY, value);
    if (state) {
      const next = { ...state, optimizedResumeMarkdown: value, updatedAt: new Date().toISOString() };
      setState(next);
      localStorage.setItem(RESUME_OPTIMIZATION_STATE_STORAGE_KEY, JSON.stringify(next));
    }
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const generateOptimizedResume = () => {
    try {
      setError("");
      const storageResume = localStorage.getItem(RESUME_STORAGE_KEY);
      const baseResume = input?.resume ?? (storageResume ? JSON.parse(storageResume) as ResumeData : null);
      if (!baseResume) {
        setError("缺少原始简历数据，无法生成画布简历。请回到首页重新导入或填写简历。");
        return;
      }

      const result = applyOptimizedMarkdownToResume(markdown, baseResume);
      if (!result.changedPaths.length) {
        setError(result.warnings[0] ?? "未能从 Markdown 中识别可写回内容，请继续在画布中手动精调。");
        return;
      }

      localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(result.resume));
      localStorage.removeItem(OPTIMIZED_RESUME_MARKDOWN_STORAGE_KEY);
      if (state) {
        const nextState = {
          ...state,
          optimizedResumeMarkdown: markdown,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(RESUME_OPTIMIZATION_STATE_STORAGE_KEY, JSON.stringify(nextState));
      }
      localStorage.setItem(
        RESUME_TOAST_STORAGE_KEY,
        result.warnings.length
          ? "已生成优化简历，可继续在画布中精调。部分内容未能自动写回，请在画布中确认。"
          : "已生成优化简历，可继续在画布中精调。"
      );
      window.dispatchEvent(new Event("resume-result-updated"));
      router.push("/");
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "生成优化简历失败，请检查 Markdown 内容后重试。");
    }
  };

  const report = state?.jdMatchReport;
  const target = report?.targetAnalysis;

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line text-muted hover:border-brand hover:text-brand"
              onClick={() => router.push("/jd-match")}
              aria-label="返回 JD 匹配诊断"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-lg font-bold">简历优化结果</h1>
              <p className="mt-1 text-xs text-muted">基于 JD 匹配诊断生成的完整优化简历</p>
            </div>
          </div>
          <AppNav active="result" />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-lg border border-line bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">AI 优化后的简历 Markdown</h2>
              <p className="mt-1 text-xs text-muted">已根据 JD 匹配诊断中的亮点、Gap、结构建议和 ATS 关键词进行重构。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-xs font-bold text-ink hover:border-brand hover:text-brand"
                onClick={copyMarkdown}
                disabled={!markdown}
              >
                <Clipboard className="h-3.5 w-3.5" />
                {copied ? "已复制" : "复制 Markdown"}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-2 text-xs font-bold text-ink hover:border-brand hover:text-brand disabled:opacity-60"
                onClick={regenerate}
                disabled={loading || !input || !report}
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                重新生成优化结果
              </button>
              <button
                type="button"
                className="rounded-md bg-brand px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                onClick={generateOptimizedResume}
                disabled={!markdown.trim()}
              >
                生成优化简历
              </button>
            </div>
          </div>
          {markdown && (
            <p className="mb-3 rounded-md border border-[#b7e0d2] bg-[#eef7f4] px-3 py-2 text-xs leading-5 text-[#0d6b4d]">
              已完成优化，所有内容均基于您的原文修改，无新增虚构内容。
            </p>
          )}
          {error && <p className="mb-3 rounded-md border border-[#f2c8c8] bg-[#fff5f5] px-3 py-2 text-sm text-[#b42318]">{error}</p>}
          <textarea
            className="min-h-[700px] w-full rounded-md border border-line bg-paper px-4 py-3 font-mono text-sm leading-7 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
            value={markdown}
            onChange={(event) => updateMarkdown(event.target.value)}
            placeholder="优化后的 Markdown 简历会显示在这里。"
          />
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-line bg-white p-4 shadow-sm">
            <h2 className="text-base font-bold">优化依据摘要</h2>
            <p className="mt-1 text-xs leading-5 text-muted">本页只展示完整优化结果，不再需要逐条接受修改。</p>
            <div className="mt-4 space-y-2 text-sm">
              <SummaryRow label="目标岗位" value={target?.targetRole || input?.targetJob || "未识别"} />
              <SummaryRow label="岗位族" value={target?.jobFamily || "未识别"} />
              <SummaryRow label="行业方向" value={target?.industry || "未识别"} />
              <SummaryRow label="匹配分" value={report ? `${report.totalScore}/100` : "-"} />
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-4 shadow-sm">
            <h2 className="text-base font-bold">本次已参考</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
              <Metric label="亮点" value={report?.highlights.length ?? 0} />
              <Metric label="Gap" value={report?.gaps.length ?? 0} />
              <Metric label="架构建议" value={report?.structureAdvice.length ?? 0} />
              <Metric label="ATS 关键词" value={report?.atsKeywords.length ?? 0} />
            </div>
          </section>

          {report?.atsKeywords.length ? (
            <section className="rounded-lg border border-line bg-white p-4 shadow-sm">
              <h2 className="text-base font-bold">ATS 关键词</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {report.atsKeywords.map((keyword) => (
                  <span key={keyword} className="rounded-full border border-line bg-paper px-2.5 py-1 text-xs text-ink">
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 rounded-md bg-paper px-3 py-2">
    <span className="text-muted">{label}</span>
    <span className="font-semibold text-ink">{value}</span>
  </div>
);

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md border border-line bg-paper px-3 py-3">
    <p className="text-lg font-black text-brand">{value}</p>
    <p className="mt-1 text-xs text-muted">{label}</p>
  </div>
);
