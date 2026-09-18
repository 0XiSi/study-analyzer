"use client";

import { useMemo } from "react";
import { Check, Filter, RotateCcw } from "lucide-react";

import type { Session } from "@/app/lib/types";

type TagFilterProps = {
  sessions: Session[];
  excludedTags: string[];
  onChange: (excludedTags: string[]) => void;
};

export function TagFilter({
  sessions,
  excludedTags,
  onChange,
}: TagFilterProps) {
  const tags = useMemo(() => {
    return Array.from(
      new Set(sessions.map((session) => session.name))
    ).sort((a, b) => a.localeCompare(b));
  }, [sessions]);

  function toggleTag(tag: string) {
    if (excludedTags.includes(tag)) {
      onChange(excludedTags.filter((item) => item !== tag));
    } else {
      onChange([...excludedTags, tag]);
    }
  }

  function resetFilters() {
    onChange([]);
  }

  return (
    <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
            <Filter size={19} className="text-slate-300" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-100">
              فیلتر تگ‌ها
            </h2>

            <p className="text-sm text-slate-400">
              تگ‌هایی که انتخاب کنید از آمار حذف می‌شوند.
            </p>
          </div>
        </div>

        {excludedTags.length > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
          >
            <RotateCcw size={15} />
            حذف فیلترها
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isExcluded = excludedTags.includes(tag);

          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                isExcluded
                  ? "border-red-500/40 bg-red-500/10 text-red-300"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-750"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  isExcluded
                    ? "border-red-400 bg-red-500 text-white"
                    : "border-slate-600"
                }`}
              >
                {isExcluded && <Check size={11} strokeWidth={3} />}
              </span>

              {tag}
            </button>
          );
        })}
      </div>

      {excludedTags.length > 0 && (
        <p className="mt-4 text-xs text-slate-500">
          {excludedTags.length} تگ از محاسبات حذف شده است.
        </p>
      )}
    </section>
  );
}