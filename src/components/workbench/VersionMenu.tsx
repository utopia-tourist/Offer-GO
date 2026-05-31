"use client";

import { History, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ResumeVersion } from "@/lib/types";

type VersionMenuProps = {
  versions: ResumeVersion[];
  onRename: (id: string, name: string) => void;
  onRestore: (version: ResumeVersion) => void;
  onDelete: (id: string) => void;
};

export function VersionMenu({ versions, onRename, onRestore, onDelete }: VersionMenuProps) {
  const [open, setOpen] = useState(false);

  const deleteVersion = (id: string, name: string) => {
    const confirmed = window.confirm(`确定删除版本「${name || "未命名版本"}」吗？删除后不可恢复。`);
    if (confirmed) onDelete(id);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
        onClick={() => setOpen((current) => !current)}
      >
        <History className="h-4 w-4" />
        版本
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-lg border border-line bg-white p-3 shadow-page">
          <h3 className="mb-2 text-sm font-bold text-ink">版本历史</h3>
          {versions.length ? (
            <div className="max-h-80 space-y-2 overflow-auto pr-1">
              {versions.map((version) => (
                <div key={version.id} className="rounded-md border border-line bg-paper p-2">
                  <input
                    className="w-full rounded border border-transparent bg-white px-2 py-1 text-xs font-semibold text-ink outline-none focus:border-brand"
                    value={version.name}
                    onChange={(event) => onRename(version.id, event.target.value)}
                    aria-label="重命名版本"
                  />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted">{new Date(version.createdAt).toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink hover:border-brand hover:text-brand"
                        onClick={() => onRestore(version)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        恢复
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-[#b42318] hover:border-[#b42318] hover:bg-[#fff5f5]"
                        onClick={() => deleteVersion(version.id, version.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-line bg-paper px-3 py-2 text-xs leading-5 text-muted">
              手动保存版本后会出现在这里。
            </p>
          )}
        </div>
      )}
    </div>
  );
}
