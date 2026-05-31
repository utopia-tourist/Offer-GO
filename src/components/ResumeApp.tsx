"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildImportQualityReport,
  defaultResumeData,
  setResumeValueByPath,
  updateResumeStyle
} from "@/lib/resume";
import type {
  CanvasBlock,
  CanvasHighlight,
  ImportQualityReport,
  ResumeData,
  ResumeStyle,
  ResumeVersion
} from "@/lib/types";
import { AiWorkbench } from "@/components/workbench/AiWorkbench";
import { ImportQualityReview } from "@/components/workbench/ImportQualityReview";
import { InlineEditPanel } from "@/components/workbench/InlineEditPanel";
import { ResumeCanvas } from "@/components/workbench/ResumeCanvas";
import { TopToolbar } from "@/components/workbench/TopToolbar";
import {
  JD_MATCH_INPUT_STORAGE_KEY,
  JD_MATCH_REPORT_STORAGE_KEY,
  OPTIMIZATION_SUGGESTIONS_STORAGE_KEY,
  RESUME_STORAGE_KEY,
  RESUME_TOAST_STORAGE_KEY,
  VERSION_STORAGE_KEY
} from "@/lib/workflow-storage";

type AiStatus = {
  configured: boolean;
  mockEnabled: boolean;
  format: string;
  model: string;
  baseUrlConfigured: boolean;
  apiKeyConfigured: boolean;
};

type ImportResumeResult = {
  rawText: string;
  resume: ResumeData;
  qualityReport: ImportQualityReport;
};

type LoadingState = "analysis" | "diagnosis" | "suggestions" | null;
type MobileTab = "canvas" | "ai";

export function ResumeApp() {
  const router = useRouter();
  const [resume, setResume] = useState<ResumeData>(() => defaultResumeData());
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [targetJob, setTargetJob] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [importQuality, setImportQuality] = useState<ImportQualityReport | null>(null);
  const [importDraft, setImportDraft] = useState<ResumeData | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<CanvasBlock | null>(null);
  const [highlights, setHighlights] = useState<CanvasHighlight[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [imageExporting, setImageExporting] = useState(false);
  const [loading] = useState<LoadingState>(null);
  const [error, setError] = useState("");
  const [resumeNotice, setResumeNotice] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("canvas");

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedResume = localStorage.getItem(RESUME_STORAGE_KEY);
    if (savedResume) {
      try {
        setResume(JSON.parse(savedResume) as ResumeData);
      } catch {
        localStorage.removeItem(RESUME_STORAGE_KEY);
      }
    }

    const savedVersions = localStorage.getItem(VERSION_STORAGE_KEY);
    if (savedVersions) {
      try {
        setVersions(JSON.parse(savedVersions) as ResumeVersion[]);
      } catch {
        localStorage.removeItem(VERSION_STORAGE_KEY);
      }
    }

    const resumeToast = localStorage.getItem(RESUME_TOAST_STORAGE_KEY);
    if (resumeToast) {
      setResumeNotice(resumeToast);
      localStorage.removeItem(RESUME_TOAST_STORAGE_KEY);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((response) => response.json())
      .then((status: AiStatus) => setAiStatus(status))
      .catch(() => setAiStatus(null));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resume));
  }, [hydrated, resume]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(versions));
  }, [hydrated, versions]);

  const saveVersion = useCallback((name: string, data: ResumeData) => {
    setVersions((current) => {
      return [
        {
          id: crypto.randomUUID(),
          name,
          createdAt: new Date().toISOString(),
          resume: structuredClone(data)
        },
        ...current
      ];
    });
  }, []);

  useEffect(() => {
    if (!highlights.length) return;

    const timer = window.setInterval(() => {
      const now = Date.now();
      setHighlights((current) => current.filter((item) => !item.expiresAt || item.expiresAt > now));
    }, 800);

    return () => window.clearInterval(timer);
  }, [highlights.length]);

  const currentTitle = useMemo(() => {
    if (resume.personalInfo.name) return `${resume.personalInfo.name} 的简历`;
    if (resume.personalInfo.targetRole) return resume.personalInfo.targetRole;
    return "未命名简历";
  }, [resume.personalInfo.name, resume.personalInfo.targetRole]);

  const addHighlight = (blockId: string, kind: CanvasHighlight["kind"], duration = 2600) => {
    setHighlights((current) => [
      ...current.filter((item) => item.blockId !== blockId),
      { blockId, kind, expiresAt: Date.now() + duration }
    ]);
  };

  const handleImport = async (file: File) => {
    try {
      setImporting(true);
      setError("");
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/import-resume", { method: "POST", body: form });
      const payload = (await response.json()) as ImportResumeResult & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "简历导入失败");

      const draft = { ...payload.resume, style: payload.resume.style ?? resume.style };
      setImportDraft(draft);
      setImportQuality(payload.qualityReport ?? buildImportQualityReport(draft));
      setSelectedBlock(null);
      setMobileTab("canvas");
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "简历导入失败");
      setMobileTab("ai");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImportDraftChange = (draft: ResumeData) => {
    setImportDraft(draft);
    setImportQuality(buildImportQualityReport(draft));
  };

  const finalizeImport = (startAnalysis: boolean) => {
    const nextResume = importDraft ?? resume;
    setResume(nextResume);
    setImportDraft(null);
    setImportQuality(null);
    setSelectedBlock(null);
    setMobileTab(startAnalysis ? "ai" : "canvas");
  };

  const diagnoseJd = async () => {
    if (!jobDescription.trim()) {
      setError("请先粘贴目标岗位 JD。");
      setMobileTab("ai");
      return;
    }

    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resume));
    localStorage.setItem(JD_MATCH_INPUT_STORAGE_KEY, JSON.stringify({ resume, targetJob, jobDescription }));
    localStorage.removeItem(JD_MATCH_REPORT_STORAGE_KEY);
    localStorage.removeItem(OPTIMIZATION_SUGGESTIONS_STORAGE_KEY);
    router.push("/jd-match");
  };

  const handleSaveBlock = (block: CanvasBlock, value: string) => {
    setResume((current) => setResumeValueByPath(current, block.path, value));
    setSelectedBlock(null);
    addHighlight(block.id, "applied");
  };

  const handleStyleChange = (style: Partial<ResumeStyle>) => {
    setResume((current) => updateResumeStyle(current, style));
  };

  const handleRestoreVersion = (version: ResumeVersion) => {
    setResume(structuredClone(version.resume));
    setImportQuality(null);
    setImportDraft(null);
    setSelectedBlock(null);
  };

  const handleRenameVersion = (id: string, name: string) => {
    setVersions((current) => current.map((version) => version.id === id ? { ...version, name } : version));
  };

  const handleDeleteVersion = (id: string) => {
    setVersions((current) => current.filter((version) => version.id !== id));
  };

  const exportPdf = () => {
    if (!canvasRef.current) return;
    setExporting(true);
    const finish = () => {
      setExporting(false);
      window.removeEventListener("afterprint", finish);
    };
    window.addEventListener("afterprint", finish);
    window.setTimeout(() => {
      window.print();
      window.setTimeout(finish, 1200);
    }, 50);
  };

  const exportImagePdf = async () => {
    const node = document.getElementById("resume-print-area");
    if (!node) {
      setError("未找到简历预览区域，无法导出图片版 PDF。");
      return;
    }

    try {
      setImageExporting(true);
      setError("");
      node.classList.add("export-image-mode");
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((resolve) => window.setTimeout(resolve, 120));

      const [{ PDFDocument }, { domToPng }] = await Promise.all([
        import("pdf-lib"),
        import("modern-screenshot")
      ]);
      const nodeRect = node.getBoundingClientRect();
      const exportBoundaries = Array.from(
        node.querySelectorAll(".resume-section-title, .resume-item, li, header")
      )
        .map((item) => {
          const rect = item.getBoundingClientRect();
          return Math.max(0, rect.bottom - nodeRect.top);
        })
        .filter((value) => value > 0)
        .sort((first, second) => first - second);
      const pngDataUrl = await domToPng(node, {
        backgroundColor: "#ffffff",
        scale: 3,
        width: node.scrollWidth,
        height: node.scrollHeight,
        style: {
          transform: "none",
          transformOrigin: "top left",
          overflow: "visible",
          boxShadow: "none"
        }
      });

      const image = new Image();
      image.src = pngDataUrl;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("图片版 PDF 生成失败：简历截图加载失败。"));
      });

      const pdf = await PDFDocument.create();
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 28.35;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;
      const imageScale = image.width / Math.max(nodeRect.width, 1);
      const sliceHeightPx = Math.max(1, Math.floor((usableHeight / usableWidth) * image.width));
      const safeBoundaries = exportBoundaries
        .map((value) => Math.round(value * imageScale))
        .filter((value) => value > 0 && value < image.height);
      const slices: Array<{ start: number; end: number }> = [];
      let sliceStart = 0;
      const minSliceHeight = Math.round(sliceHeightPx * 0.55);

      while (sliceStart < image.height) {
        const targetEnd = Math.min(image.height, sliceStart + sliceHeightPx);
        if (targetEnd >= image.height) {
          slices.push({ start: sliceStart, end: image.height });
          break;
        }

        const safeEnd = [...safeBoundaries]
          .reverse()
          .find((boundary) => boundary > sliceStart + minSliceHeight && boundary <= targetEnd - Math.round(12 * imageScale));

        const end = safeEnd ?? targetEnd;
        slices.push({ start: sliceStart, end });
        sliceStart = end;
      }

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("图片版 PDF 生成失败：浏览器不支持 Canvas。");

      for (const slice of slices) {
        const currentSliceHeight = slice.end - slice.start;
        canvas.width = image.width;
        canvas.height = currentSliceHeight;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
          image,
          0,
          slice.start,
          image.width,
          currentSliceHeight,
          0,
          0,
          image.width,
          currentSliceHeight
        );

        const sliceDataUrl = canvas.toDataURL("image/png");
        const slicePng = await pdf.embedPng(sliceDataUrl);
        const sliceHeight = (currentSliceHeight * usableWidth) / image.width;
        const page = pdf.addPage([pageWidth, pageHeight]);
        page.drawImage(slicePng, {
          x: margin,
          y: pageHeight - margin - sliceHeight,
          width: usableWidth,
          height: sliceHeight
        });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${resume.personalInfo.name.trim() || "resume"}-image.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "导出图片版 PDF 失败，请尝试使用浏览器原生 PDF 导出。");
    } finally {
      node.classList.remove("export-image-mode");
      setImageExporting(false);
    }
  };

  return (
    <main className="min-h-screen">
      <TopToolbar
        title={currentTitle}
        importing={importing}
        exporting={exporting}
        imageExporting={imageExporting}
        previewMode={previewMode}
        versions={versions}
        fileInputRef={fileInputRef}
        onImport={handleImport}
        onSaveVersion={(name) => saveVersion(name, resume)}
        onTogglePreviewMode={() => setPreviewMode((current) => !current)}
        onExportPdf={exportPdf}
        onExportImagePdf={exportImagePdf}
        onRenameVersion={handleRenameVersion}
        onRestoreVersion={handleRestoreVersion}
        onDeleteVersion={handleDeleteVersion}
      />

      <div className="no-print mx-auto flex max-w-[1500px] gap-2 px-4 pt-4 lg:hidden">
        <button
          type="button"
          className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${mobileTab === "canvas" ? "bg-brand text-white" : "bg-white text-muted"}`}
          onClick={() => setMobileTab("canvas")}
        >
          简历画布
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold ${mobileTab === "ai" ? "bg-brand text-white" : "bg-white text-muted"}`}
          onClick={() => setMobileTab("ai")}
        >
          AI 工作台
        </button>
      </div>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[minmax(680px,1fr)_420px] lg:px-6">
        <section className={`${mobileTab === "canvas" ? "block" : "hidden"} lg:block`}>
          {importQuality && importDraft ? (
            <ImportQualityReview
              report={importQuality}
              resume={importDraft}
              onResumeChange={handleImportDraftChange}
              onConfirm={() => finalizeImport(true)}
              onFix={() => finalizeImport(false)}
            />
          ) : (
            <>
              {resumeNotice && (
                <div className="no-print mb-4 flex items-start justify-between gap-3 rounded-lg border border-[#b7e0d2] bg-[#eef7f4] px-4 py-3 text-sm leading-6 text-[#0d6b4d] shadow-sm">
                  <span>{resumeNotice}</span>
                  <button
                    type="button"
                    className="shrink-0 rounded-md border border-[#b7e0d2] px-2 py-1 text-xs font-semibold text-[#0d6b4d] hover:bg-white"
                    onClick={() => setResumeNotice("")}
                  >
                    知道了
                  </button>
                </div>
              )}
              {!previewMode && (
                <InlineEditPanel
                  block={selectedBlock}
                  style={resume.style}
                  onSave={handleSaveBlock}
                  onStyleChange={handleStyleChange}
                  onClose={() => setSelectedBlock(null)}
                />
              )}
              <ResumeCanvas
                resume={resume}
                canvasRef={canvasRef}
                selectedBlockId={selectedBlock?.id}
                highlights={highlights}
                onSelectBlock={(block) => {
                  if (previewMode) return;
                  setSelectedBlock(block);
                }}
              />
            </>
          )}
        </section>

        <section className={`${mobileTab === "ai" ? "block" : "hidden"} lg:block`}>
          <AiWorkbench
            resume={resume}
            targetJob={targetJob}
            jobDescription={jobDescription}
            loading={loading}
            error={error}
            aiConfigured={Boolean(aiStatus?.configured)}
            onTargetJobChange={setTargetJob}
            onJobDescriptionChange={setJobDescription}
            onDiagnose={diagnoseJd}
          />
        </section>
      </div>
    </main>
  );
}
