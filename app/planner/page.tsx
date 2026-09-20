"use client";

import { useMemo, useState } from "react";
import {
  Atom,
  FlaskConical,
  Grid2X2,
  Hash,
  Sigma,
  Triangle,
  Upload,
  Zap,
} from "lucide-react";

type Part = {
  subject: string;
  from: number;
  to: number;
  count: number;
  step?: number;
};

type Day = Part[];

type SubjectStyle = {
  icon: typeof Sigma;
  className: string;
  iconClassName: string;
};

/*
|--------------------------------------------------------------------------
| Subject appearance
|--------------------------------------------------------------------------
|
| The subject itself comes from output.txt.
| This object is ONLY for deciding its visual appearance.
|
*/

function getSubjectStyle(subject: string): SubjectStyle {
  const name = subject.trim();

  if (name.includes("شیمی")) {
    return {
      icon: FlaskConical,
      className: "border-emerald-500/20 bg-emerald-500/[0.06]",
      iconClassName: "bg-emerald-500/10 text-emerald-300",
    };
  }

  if (name.includes("هندسه")) {
    return {
      icon: Triangle,
      className: "border-orange-500/20 bg-orange-500/[0.06]",
      iconClassName: "bg-orange-500/10 text-orange-300",
    };
  }

  if (name.includes("فیزیک")) {
    return {
      icon: Zap,
      className: "border-cyan-500/20 bg-cyan-500/[0.06]",
      iconClassName: "bg-cyan-500/10 text-cyan-300",
    };
  }

  if (name.includes("گسسته")) {
    return {
      icon: Hash,
      className: "border-pink-500/20 bg-pink-500/[0.06]",
      iconClassName: "bg-pink-500/10 text-pink-300",
    };
  }

  if (name.includes("حسابان")) {
    return {
      icon: Sigma,
      className: "border-violet-500/20 bg-violet-500/[0.06]",
      iconClassName: "bg-violet-500/10 text-violet-300",
    };
  }

  if (name.includes("ریاضی")) {
    return {
      icon: Sigma,
      className: "border-blue-500/20 bg-blue-500/[0.06]",
      iconClassName: "bg-blue-500/10 text-blue-300",
    };
  }

  return {
    icon: Atom,
    className: "border-slate-500/20 bg-slate-500/[0.06]",
    iconClassName: "bg-slate-500/10 text-slate-300",
  };
}

/*
|--------------------------------------------------------------------------
| Parse output.txt
|--------------------------------------------------------------------------
|
| Example:
|
| 1  ریاضی 1: 3352–3378 with jump 2 [14]
|    گسسته: 1–13 [13]
|    هندسه 1: 1–18 [18]
|    فیزیک 1: 1–9 [9]
|
*/

function parseSchedule(text: string): Day[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const days: Day[] = [];

  for (const line of lines) {
    /*
     * Get day number.
     */
    const dayMatch = line.match(/^(\d+)\s+/);

    if (!dayMatch) {
      continue;
    }

    const dayNumber = Number(dayMatch[1]);

    /*
     * Remove day number.
     */
    const content = line.slice(dayMatch[0].length);

    /*
     * Entries are separated by multiple spaces.
     */
    const entries = content
      .split(/\s{2,}/)
      .map((entry) => entry.trim())
      .filter(Boolean);

    const parts: Part[] = [];

    for (const entry of entries) {
      /*
       * Extract:
       *
       * subject
       * from
       * to
       * optional step
       * count
       */
      const match = entry.match(
        /^(.+?):\s*(\d+)\s*[–—-]\s*(\d+)(?:\s+with jump\s+(\d+))?\s*\[(\d+)\]$/
      );

      if (!match) {
        continue;
      }

      const [, subject, from, to, step, count] = match;

      parts.push({
        /*
         * IMPORTANT:
         * Keep the exact subject from output.txt.
         */
        subject: subject.trim(),

        from: Number(from),
        to: Number(to),
        count: Number(count),

        ...(step
          ? {
              step: Number(step),
            }
          : {}),
      });
    }

    if (parts.length > 0) {
      days[dayNumber - 1] = parts;
    }
  }

  return days.filter(Boolean);
}

/*
|--------------------------------------------------------------------------
| Part
|--------------------------------------------------------------------------
*/

function PartCard({ part }: { part: Part }) {
  const style = getSubjectStyle(part.subject);
  const Icon = style.icon;

  return (
    <div
      className={`min-w-0 rounded-xl border px-2.5 py-2 ${style.className}`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${style.iconClassName}`}
        >
          <Icon size={14} strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-[11px] font-bold text-slate-200">
              {part.subject}
            </span>

            <span className="shrink-0 rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[10px] font-black text-slate-300">
              {part.count}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[10px] font-medium tabular-nums text-slate-400">
              {part.from} ← {part.to}
            </span>

            {part.step !== undefined && (
              <>
                <span className="h-0.5 w-0.5 rounded-full bg-slate-600" />

                <span className="text-[9px] text-slate-500">
                  گام {part.step}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function Page() {
  const [days, setDays] = useState<Day[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const totalTests = useMemo(() => {
    return days.reduce(
      (total, day) =>
        total +
        day.reduce((dayTotal, part) => dayTotal + part.count, 0),
      0
    );
  }, [days]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    try {
      const text = await file.text();
      const parsed = parseSchedule(text);

      if (parsed.length === 0) {
        setError("برنامه‌ای در فایل پیدا نشد.");
        return;
      }

      setDays(parsed);
      setFileName(file.name);
    } catch {
      setError("خواندن فایل انجام نشد.");
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-dvh bg-[#08090c] px-3 py-5 text-slate-100"
    >
      <div className="mx-auto w-full max-w-120">
        {/* Header */}
        <header className="mb-4 px-1">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-medium text-slate-500">
                برنامه تست
              </p>

              <h1 className="mt-0.5 text-xl font-black tracking-tight text-white">
                {days.length
                  ? `برنامه ${days.length} روزه`
                  : "برنامه تست"}
              </h1>
            </div>

            {days.length > 0 && (
              <div className="text-left">
                <div className="text-lg font-black tabular-nums text-white">
                  {totalTests}
                </div>

                <div className="text-[9px] text-slate-500">
                  تست در {days.length} روز
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Upload */}
        <label className="mb-4 block cursor-pointer">
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] px-4 py-5 transition hover:border-white/20 hover:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-slate-300">
                <Upload size={18} />
              </div>

              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-200">
                  {fileName
                    ? fileName
                    : "انتخاب فایل output.txt"}
                </div>

                <div className="mt-0.5 text-[10px] text-slate-500">
                  اطلاعات برنامه مستقیماً از فایل خوانده می‌شود.
                </div>
              </div>
            </div>
          </div>
        </label>

        {/* Error */}
        {error && (
          <div className="mb-3 rounded-xl border border-red-500/10 bg-red-500/[0.05] px-3 py-2 text-[10px] text-red-400">
            {error}
          </div>
        )}

        {/* Days */}
        {days.length > 0 && (
          <div className="space-y-2">
            {days.map((parts, index) => {
              const dayNumber = index + 1;

              const total = parts.reduce(
                (sum, part) => sum + part.count,
                0
              );

              return (
                <section
                  key={dayNumber}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2.5"
                >
                  <div className="mb-2 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.07] text-xs font-black text-white">
                        {dayNumber}
                      </div>

                      <span className="text-xs font-bold text-slate-300">
                        روز {dayNumber}
                      </span>
                    </div>

                    <span className="text-[10px] font-medium text-slate-500">
                      {total} تست
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {parts.map((part, partIndex) => (
                      <PartCard
                        key={`${dayNumber}-${partIndex}`}
                        part={part}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {days.length === 0 && !error && (
          <div className="py-10 text-center text-[10px] text-slate-600">
            فایل برنامه را انتخاب کنید
          </div>
        )}

        {/* Footer */}
        {days.length > 0 && (
          <footer className="mt-3 flex items-center justify-between px-2 text-[9px] text-slate-600">
            <span>برنامه تست</span>

            <span>
              {days.length} روز · {totalTests} تست
            </span>
          </footer>
        )}
      </div>
    </main>
  );
}