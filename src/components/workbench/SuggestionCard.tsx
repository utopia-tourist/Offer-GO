"use client";

import { Check, Edit3, LocateFixed, X } from "lucide-react";
import { useState } from "react";
import type { AiSuggestion } from "@/lib/types";

type SuggestionCardProps = {
  suggestion: AiSuggestion;
  onFocus: (suggestion: AiSuggestion) => void;
  onAccept: (suggestion: AiSuggestion, editedText?: string) => void;
  onIgnore: (suggestion: AiSuggestion) => void;
};

const typeLabel: Record<AiSuggestion["type"], string> = {
  expression: "表达优化",
  jd_keyword: "JD 关键词补充",
  quantification: "量化补充",
  structure: "结构调整"
};

export function SuggestionCard({ suggestion, onFocus, onAccept, onIgnore }: SuggestionCardProps) {
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(suggestion.suggestedText);

  return (
    <article className={`rounded-lg border p-3 ${suggestion.status === "accepted" ? "border-[#b7e0d2] bg-[#f5fbf8]" : suggestion.status === "ignored" ? "border-line bg-paper opacity-70" : "border-line bg-white"}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <span className="rounded-md bg-[#e9efff] px-2 py-1 text-[11px] font-bold text-brand">{typeLabel[suggestion.type]}</span>
          <h3 className="mt-2 text-sm font-bold text-ink">{suggestion.locationLabel}</h3>
        </div>
        <button type="button" className="rounded-md border border-line p-2 text-muted hover:text-brand" onClick={() => onFocus(suggestion)} aria-label="定位到简历内容">
          <LocateFixed className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-2">
        <div className="rounded-md border border-[#ffd0d0] bg-[#fff4f4] p-2">
          <p className="mb-1 text-[11px] font-bold text-[#b42318]">原文</p>
          <p className="whitespace-pre-wrap text-xs leading-5 text-ink">{suggestion.originalText || "（空）"}</p>
        </div>
        <div className="rounded-md border border-[#b7e0d2] bg-[#eef7f4] p-2">
          <p className="mb-1 text-[11px] font-bold text-success">建议改写</p>
          {editing ? (
            <textarea
              className="min-h-24 w-full rounded-md border border-line bg-white px-2 py-1 text-xs leading-5 outline-none focus:border-brand"
              value={editedText}
              onChange={(event) => setEditedText(event.target.value)}
            />
          ) : (
            <p className="whitespace-pre-wrap text-xs leading-5 text-ink">{suggestion.suggestedText || "（空）"}</p>
          )}
        </div>
        <p className="rounded-md bg-paper px-2 py-1 text-xs leading-5 text-muted"><strong>原因：</strong>{suggestion.reason}</p>
        <p className="rounded-md bg-[#fff8eb] px-2 py-1 text-xs leading-5 text-[#8a5a00]"><strong>风险：</strong>{suggestion.risk}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="inline-flex items-center gap-1 rounded-md bg-success px-3 py-2 text-xs font-bold text-white" onClick={() => onAccept(suggestion, editing ? editedText : undefined)}>
          <Check className="h-3.5 w-3.5" />
          接受
        </button>
        <button type="button" className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-3 py-2 text-xs font-bold text-ink" onClick={() => onIgnore(suggestion)}>
          <X className="h-3.5 w-3.5" />
          忽略
        </button>
        <button type="button" className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-3 py-2 text-xs font-bold text-ink" onClick={() => setEditing((current) => !current)}>
          <Edit3 className="h-3.5 w-3.5" />
          {editing ? "收起编辑" : "编辑建议"}
        </button>
      </div>
    </article>
  );
}
