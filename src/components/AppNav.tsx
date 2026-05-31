"use client";

import { ChevronDown, FileText, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RESUME_OPTIMIZATION_STATE_STORAGE_KEY } from "@/lib/workflow-storage";

type AppNavProps = {
  active: "home" | "resume" | "jd-match" | "result";
};

export function AppNav({ active }: AppNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    const refresh = () => setHasResult(Boolean(localStorage.getItem(RESUME_OPTIMIZATION_STATE_STORAGE_KEY)));
    refresh();
    window.addEventListener("resume-result-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("resume-result-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <nav className="no-print flex items-center gap-4 text-sm text-muted">
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 font-semibold hover:text-ink ${active === "home" ? "text-ink" : ""}`}
        onClick={() => router.push("/")}
      >
        <Home className="h-4 w-4" />
        首页
      </button>
      <span className="h-4 w-px bg-line" />
      <div className="relative">
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 font-semibold hover:text-ink ${active !== "home" ? "text-ink" : ""}`}
          onClick={() => setOpen((current) => !current)}
        >
          <FileText className="h-4 w-4" />
          简历优化
          <ChevronDown className="h-4 w-4" />
        </button>
        {open && (
          <div className="absolute left-0 top-8 z-40 w-48 rounded-lg border border-line bg-white p-1 shadow-page">
            <button
              type="button"
              className={`w-full rounded-md px-3 py-2 text-left text-sm font-semibold hover:bg-paper ${active === "jd-match" ? "text-brand" : "text-ink"}`}
              onClick={() => {
                setOpen(false);
                router.push("/jd-match");
              }}
            >
              JD 匹配诊断
            </button>
            <button
              type="button"
              className={`w-full rounded-md px-3 py-2 text-left text-sm font-semibold ${hasResult ? "text-ink hover:bg-paper" : "cursor-not-allowed text-muted/50"}`}
              disabled={!hasResult}
              onClick={() => {
                if (!hasResult) return;
                setOpen(false);
                router.push("/optimization-result");
              }}
            >
              简历优化结果
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
