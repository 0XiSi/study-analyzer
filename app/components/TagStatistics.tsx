import { Clock3 } from "lucide-react";

import type { Session } from "@/app/lib/types";
import { formatDuration } from "@/app/lib/formatting";

type TagStatisticsProps = {
  sessions: Session[];
  totalSeconds: number;
};

export function TagStatistics({
  sessions,
  totalSeconds,
}: TagStatisticsProps) {
  const tagTotals = sessions.reduce<Record<string, number>>(
    (acc, session) => {
      acc[session.name] =
        (acc[session.name] ?? 0) + session.durationSeconds;

      return acc;
    },
    {}
  );

  const entries = Object.entries(tagTotals).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-100">
          آمار تگ‌ها
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          توزیع زمان مطالعه بین تگ‌های باقی‌مانده
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 py-8 text-center text-sm text-slate-500">
          داده‌ای برای نمایش وجود ندارد.
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(([tag, seconds]) => {
            const percentage =
              totalSeconds > 0
                ? (seconds / totalSeconds) * 100
                : 0;

            return (
              <div key={tag}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="truncate text-sm font-medium text-slate-200">
                    {tag}
                  </span>

                  <div className="flex shrink-0 items-center gap-3 text-xs text-slate-400">
                    <span>{percentage.toFixed(1)}%</span>

                    <span className="flex items-center gap-1.5">
                      <Clock3 size={14} />
                      {formatDuration(seconds)}
                    </span>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-slate-300 transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}