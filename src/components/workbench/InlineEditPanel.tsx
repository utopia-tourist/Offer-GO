"use client";

import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultResumeStyle } from "@/lib/resume";
import type { CanvasBlock, ResumeStyle } from "@/lib/types";

type InlineEditPanelProps = {
  block: CanvasBlock | null;
  style?: ResumeStyle;
  onSave: (block: CanvasBlock, value: string) => void;
  onStyleChange: (style: Partial<ResumeStyle>) => void;
  onClose: () => void;
};

export function InlineEditPanel({ block, style, onSave, onStyleChange, onClose }: InlineEditPanelProps) {
  const [value, setValue] = useState("");
  const canvasStyle = { ...defaultResumeStyle(), ...(style ?? {}) };

  useEffect(() => {
    setValue(block?.value ?? "");
  }, [block]);

  if (!block) return null;

  return (
    <div className="no-print sticky top-20 z-10 mb-3 rounded-lg border border-line bg-white p-3 shadow-page">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted">正在编辑</p>
          <h3 className="text-sm font-bold text-ink">{block.label}</h3>
        </div>
        <button type="button" className="rounded-md p-2 text-muted hover:bg-paper hover:text-ink" onClick={onClose} aria-label="关闭编辑">
          <X className="h-4 w-4" />
        </button>
      </div>
      {block.multiline ? (
        <textarea
          className="min-h-28 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      ) : (
        <input
          className="w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      )}
      <div className="mt-3 grid grid-cols-2 gap-3 rounded-md border border-line bg-paper p-3 md:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">字体</span>
          <select
            className="w-full rounded-md border border-line bg-white px-2 py-2 text-xs outline-none focus:border-brand"
            value={canvasStyle.fontFamily}
            onChange={(event) => onStyleChange({ fontFamily: event.target.value as ResumeStyle["fontFamily"] })}
          >
            <option value="system">系统商务</option>
            <option value="sans">黑体无衬线</option>
            <option value="serif">宋体衬线</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">字号 {canvasStyle.fontSize}px</span>
          <input
            type="range"
            min="11"
            max="16"
            step="1"
            value={canvasStyle.fontSize}
            onChange={(event) => onStyleChange({ fontSize: Number(event.target.value) })}
            className="w-full"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">行距 {canvasStyle.lineHeight.toFixed(1)}</span>
          <input
            type="range"
            min="1.2"
            max="2"
            step="0.1"
            value={canvasStyle.lineHeight}
            onChange={(event) => onStyleChange({ lineHeight: Number(event.target.value) })}
            className="w-full"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">段距 {canvasStyle.paragraphSpacing}px</span>
          <input
            type="range"
            min="6"
            max="22"
            step="1"
            value={canvasStyle.paragraphSpacing}
            onChange={(event) => onStyleChange({ paragraphSpacing: Number(event.target.value) })}
            className="w-full"
          />
        </label>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" className="rounded-md border border-line px-3 py-2 text-sm font-semibold text-ink" onClick={onClose}>
          取消
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white"
          onClick={() => onSave(block, value)}
        >
          <Check className="h-4 w-4" />
          保存
        </button>
      </div>
    </div>
  );
}
