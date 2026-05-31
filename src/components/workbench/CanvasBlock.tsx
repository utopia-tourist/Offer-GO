"use client";

import type { CanvasBlock, CanvasHighlight } from "@/lib/types";

type CanvasBlockProps = {
  block: CanvasBlock;
  className?: string;
  children: React.ReactNode;
  highlight?: CanvasHighlight;
  onSelect: (block: CanvasBlock) => void;
};

export function CanvasBlockView({ block, className = "", children, highlight, onSelect }: CanvasBlockProps) {
  const highlightClass =
    highlight?.kind === "applied"
      ? "bg-[#e9f7ef] ring-2 ring-success/35"
      : highlight?.kind === "suggested"
        ? "bg-[#fff8db] ring-2 ring-warning/30"
        : "hover:bg-[#f4f7ff]";

  return (
    <button
      type="button"
      id={block.id}
      data-block-id={block.id}
      title="双击编辑这段内容"
      className={`block min-w-0 max-w-full whitespace-pre-wrap break-words rounded-sm px-1 text-left transition ${highlightClass} ${className || "w-full"}`}
      onDoubleClick={() => onSelect(block)}
    >
      {children}
    </button>
  );
}
