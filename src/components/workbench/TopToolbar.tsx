"use client";

import { Download, Eye, Pencil, Save, Upload } from "lucide-react";
import { useState } from "react";
import type { ResumeVersion } from "@/lib/types";
import { AppNav } from "@/components/AppNav";
import { VersionMenu } from "@/components/workbench/VersionMenu";

type TopToolbarProps = {
  title: string;
  importing: boolean;
  exporting: boolean;
  imageExporting: boolean;
  previewMode: boolean;
  versions: ResumeVersion[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImport: (file: File) => void;
  onSaveVersion: (name: string) => void;
  onTogglePreviewMode: () => void;
  onExportPdf: () => void;
  onExportImagePdf: () => void;
  onRenameVersion: (id: string, name: string) => void;
  onRestoreVersion: (version: ResumeVersion) => void;
  onDeleteVersion: (id: string) => void;
};

export function TopToolbar({
  title,
  importing,
  exporting,
  imageExporting,
  previewMode,
  versions,
  fileInputRef,
  onImport,
  onSaveVersion,
  onTogglePreviewMode,
  onExportPdf,
  onExportImagePdf,
  onRenameVersion,
  onRestoreVersion,
  onDeleteVersion
}: TopToolbarProps) {
  const [saveName, setSaveName] = useState(title);
  const [naming, setNaming] = useState(false);

  const save = () => {
    const name = saveName.trim() || title;
    onSaveVersion(name);
    setNaming(false);
  };

  return (
    <header className="no-print sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-8">
          <div>
            <h1 className="text-lg font-bold text-ink">Offer Go</h1>
            <p className="text-xs text-muted">你的专属 AI 求职助手</p>
          </div>
          <AppNav active="resume" />
        </div>
        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onImport(file);
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand disabled:opacity-60"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            <Upload className="h-4 w-4" />
            {importing ? "导入中" : "导入简历"}
          </button>
          {naming ? (
            <div className="flex items-center gap-2 rounded-md border border-line bg-white p-1">
              <input
                className="w-40 px-2 py-1 text-sm outline-none"
                value={saveName}
                onChange={(event) => setSaveName(event.target.value)}
                placeholder="版本名称"
              />
              <button type="button" className="rounded bg-brand px-2 py-1 text-xs font-bold text-white" onClick={save}>
                保存
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
              onClick={() => {
                setSaveName(title);
                setNaming(true);
              }}
            >
              <Save className="h-4 w-4" />
              保存版本
            </button>
          )}
          <VersionMenu
            versions={versions}
            onRename={onRenameVersion}
            onRestore={onRestoreVersion}
            onDelete={onDeleteVersion}
          />
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
            onClick={onTogglePreviewMode}
          >
            {previewMode ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {previewMode ? "编辑模式" : "预览模式"}
          </button>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f49a6] disabled:opacity-60"
                onClick={onExportPdf}
                disabled={exporting || imageExporting}
              >
                <Download className="h-4 w-4" />
                {exporting ? "准备打印..." : "导出 PDF（推荐）"}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand disabled:opacity-60"
                onClick={onExportImagePdf}
                disabled={exporting || imageExporting}
              >
                <Download className="h-4 w-4" />
                {imageExporting ? "生成中..." : "导出图片版 PDF（备用）"}
              </button>
            </div>
            <p className="max-w-[360px] text-[11px] leading-4 text-muted">
              推荐使用 PDF 导出，适合正式投递；图片版 PDF 用于排版兼容问题时备用。
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
