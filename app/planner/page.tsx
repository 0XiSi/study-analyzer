"use client";

import { useMemo, useState } from "react";
import {
  Atom,
  FlaskConical,
  Hash, LineSquiggle,
  Sigma,
  Triangle,
  Upload,
} from "lucide-react";

type Range = {
  from: number;
  to: number;
};

type Part = {
  subject: string;
  ranges: Range[];
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
      icon: LineSquiggle,
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
| Parse a single range
|--------------------------------------------------------------------------
*/

function parseRange(rangeText: string): Range | null {
  const match = rangeText
    .trim()
    .match(/^(\d+)\s*[–—-]\s*(\d+)$/);

  if (!match) {
    return null;
  }

  return {
    from: Number(match[1]),
    to: Number(match[2]),
  };
}

/*
|--------------------------------------------------------------------------
| Parse output.txt
|--------------------------------------------------------------------------
*/

function parseSchedule(text: string): Day[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const days: Day[] = [];

  for (const line of lines) {
    const dayMatch = line.match(/^(\d+)\s+/);

    if (!dayMatch) {
      continue;
    }

    const dayNumber = Number(dayMatch[1]);
    const content = line.slice(dayMatch[0].length);

    /*
    * Entries are separated by 2+ spaces.
    *
    * Example:
    * ریاضی 1: 169–185, 2881–2882 [19]    گسسته: 56–72 [17]
    */
    const entries = content
      .split(/\s{2,}/)
      .map((entry) => entry.trim())
      .filter(Boolean);

    const parts: Part[] = [];

    for (const entry of entries) {
      /*
      * Supports:
      *
      * ریاضی 1: 169–185 [20]
      * ریاضی 1: 169–185, 2881–2882 [19]
      * شیمی 2: 204–230 with jump 2 [14]
      * حسابان 2: 275–290, 424–431 [24]
      */
      const match = entry.match(
        /^(.+?):\s*(.+?)(?:\s+with jump\s+(\d+))?\s*\[(\d+)\]$/
      );

      if (!match) {
        continue;
      }

      const [, subject, rangesText, step, count] = match;

      /*
      |--------------------------------------------------------------------------
      | Multiple ranges
      |--------------------------------------------------------------------------
      |
      | "169–185, 2881–2882"
      |       ↓
      | [
      |   { from: 169, to: 185 },
      |   { from: 2881, to: 2882 }
      | ]
      |
      */

      const ranges = rangesText
        .split(",")
        .map((range) => parseRange(range))
        .filter((range): range is Range => range !== null);

      if (ranges.length === 0) {
        continue;
      }

      parts.push({
        subject: subject.trim(),
        ranges,
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
| Part Card
|--------------------------------------------------------------------------
*/

function PartCard({ part }: { part: Part }) {
  const style = getSubjectStyle(part.subject);
  const Icon = style.icon;

  return (
    <div
      className={`min-w-0 rounded-xl border px-2.5 py-2 font-vazirmatn 2xl:px-1.5 2xl:py-1.5 ${style.className}`}
    >
      <div className="flex items-center gap-2 font-vazirmatn 2xl:gap-1.5">
        {/* Icon */}
        <div
          className={`
            flex h-7 w-7 shrink-0 items-center justify-center rounded-lg
            2xl:h-10 2xl:w-10
            ${style.iconClassName}
          `}
        >
          <Icon
            size={20}
            strokeWidth={2.2}
            className=""
          />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Subject + count */}
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-[11px] font-bold text-slate-200 2xl:text-[15px]">
              {part.subject}
            </span>

            <span className=" w-7 rounded-md bg-white/[0.07] px-1.5 py-0.5 font-black text-slate-300 2xl:px-1">
              {part.count}
            </span>
          </div>

          {/* Ranges */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            {part.ranges.map((range, index) => (
              <div
                key={`${range.from}-${range.to}-${index}`}
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                {index > 0 && (
                  <span className="h-1 w-1 rounded-full bg-slate-600" />
                )}

                <span className="text-[10px] font-medium tabular-nums text-slate-400 2xl:text-[13px]">
                  {range.from} ← {range.to}
                </span>
              </div>
            ))}

            {part.step !== undefined && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="h-0.5 w-0.5 rounded-full bg-slate-600" />

                <span className="text-[9px] text-slate-500 2xl:text-[8px]">
                  گام {part.step}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Total / Summary Card
|--------------------------------------------------------------------------
*/

function SummaryCard({
  subjectTotals,
  totalTests,
}: {
  subjectTotals: { subject: string; count: number }[];
  totalTests: number;
})
{
  return (
    <section
      className="
        min-w-0
        rounded-2xl
        border border-white/[0.09]
        bg-white/[0.035]
        p-2.5
        lg:p-2
        2xl:min-h-[250px]
        2xl:p-2
      "

    >
      {/*
                    2xl:min-h-[calc(100vh-145px)]
      */}

      {/* Header */}
      <div className="mb-2 flex items-center justify-between px-1 2xl:mb-1.5">
        <div className="flex items-center gap-2">
          <div
            className="
              flex h-7 w-7
              items-center justify-center
              rounded-lg
              bg-white/[0.09]
              text-xs font-black text-white
              2xl:h-6
              2xl:w-6
              2xl:text-[10px]
            "
          >
            Σ
          </div>

          <span className="text-xs font-vazirmatn font-bold text-slate-200 2xl:text-[10px]">
            مجموع
          </span>
        </div>

        <span className="text-[11px] font-vazirmatn font-black tabular-nums text-white">
          {totalTests} تست
        </span>
      </div>

      {/* Subject totals */}
      <div className="grid grid-cols-2 gap-1.5 2xl:gap-1">
        {subjectTotals.map(({ subject, count }) => {
          const style = getSubjectStyle(subject);
          const Icon = style.icon;

          return (
            <div
              key={subject}
              className={`
                flex min-w-0 items-center justify-between
                rounded-xl border
                px-1.5 py-2
                2xl:px-1.5 2xl:py-1.5
                ${style.className}
              `}
            >
              <div className="flex min-w-0 items-center gap-2 2xl:gap-1.5">
                <div
                  className={`
                    flex h-4 w-4 shrink-0 items-center justify-center
                    rounded-lg
                    2xl:h-6 2xl:w-6
                    ${style.iconClassName}
                  `}
                >
                  <Icon
                    size={10}
                    strokeWidth={2.2}
                    className="2xl:size-3"
                  />
                </div>

                <span className="truncate text-[11px] font-vazirmatn font-bold text-slate-200 2xl:text-[12px]">
                  {subject}
                </span>
              </div>

              <span className="shrink-0 rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[10px] font-vazirmatn font-black tabular-nums text-slate-300 2xl:px-1 2xl:text-[12px]">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </section>
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

  /*
  |--------------------------------------------------------------------------
  | Total tests
  |--------------------------------------------------------------------------
  */

  const totalTests = useMemo(() => {
    return days.reduce(
      (total, day) =>
        total +
        day.reduce((dayTotal, part) => dayTotal + part.count, 0),
      0
    );
  }, [days]);

  /*
  |--------------------------------------------------------------------------
  | Total tests per subject
  |--------------------------------------------------------------------------
  */

  const subjectTotals = useMemo(() => {
    const totals = new Map<string, number>();

    for (const day of days) {
      for (const part of day) {
        totals.set(
          part.subject,
          (totals.get(part.subject) ?? 0) + part.count
        );
      }
    }

    return Array.from(totals.entries()).map(
      ([subject, count]) => ({
        subject,
        count,
      })
    );
  }, [days]);

  /*
  |--------------------------------------------------------------------------
  | Upload
  |--------------------------------------------------------------------------
  */

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
      className="
        min-h-dvh
        bg-[#08090c]
        px-3 py-4
        text-slate-100
        sm:px-4
        lg:px-5 lg:py-5
      "
    >
      <div className="mx-auto w-full max-w-[1900px]">
        {/* Header */}
        <header className="mb-4 px-1 lg:mb-3">
          <div className="flex items-end justify-between">
            <div>

              <h1 className="mt-0.5 text-xl font-vazirmatn font-black tracking-tight text-white lg:text-2xl">
                {days.length
                  ? `برنامه ${days.length} روزه`
                  : "برنامه تست"}
              </h1>
            </div>

            {days.length > 0 && (
              <div className="text-left flex-row w-50">
                <div className="text-lg font-vazirmatn font-black tabular-nums text-white lg:text-xl">
                  {totalTests}
                </div>

                <div className="text-[10px] font-vazirmatn text-slate-500">
                  تست در {days.length} روز
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Upload */}
        <label className="mb-4 block cursor-pointer lg:mb-3">
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            className="
              rounded-2xl
              border border-dashed border-white/10
              bg-white/[0.025]
              px-4 py-4
              transition
              hover:border-white/20
              hover:bg-white/[0.04]
              lg:px-3 lg:py-3
            "
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-slate-300 lg:h-8 lg:w-8">
                <Upload size={17} />
              </div>

              <div className="min-w-0 font-vazirmatn">
                <div className="text-xs font-bold text-slate-200">
                  {fileName
                    ? fileName
                    : "انتخاب فایل output.txt"}
                </div>

                <div className="mt-0.5 text-[10px]  text-slate-500">
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
          <div
            className="
              grid gap-2
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              xl:grid-cols-5
              2xl:grid-cols-6
            "
          >
            {/* Summary - FIRST CARD */}
            <SummaryCard
              subjectTotals={subjectTotals}
              totalTests={totalTests}
            />

            {/* Actual days */}
            {days.map((parts, index) => {
              const dayNumber = index + 1;

              const total = parts.reduce(
                (sum, part) => sum + part.count,
                0
              );

              return (
                <section
                  key={dayNumber}
                  className="
                    min-w-0
                    rounded-2xl
                    border border-white/[0.07]
                    bg-white/[0.025]
                    p-2.5
                    lg:p-2
                    2xl:min-h-[250px]
                    2xl:p-2
                  "
                >
                  {/*
                    2xl:min-h-[calc(100vh-145px)]
                   */}

                  {/* Day header */}
                  <div className="mb-2 flex items-center justify-between px-1 2xl:mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="
                          flex flex-row h-7 w-13 p-2
                          items-center justify-center
                          rounded-lg
                          bg-white/[0.07]
                          text-xs font-vazirmatn font-black text-white
                          2xl:h-6
                          2xl:w-13
                          2xl:text-[13px]
                        "
                      >
                        روز{" "}{dayNumber}
                      </div>
                    </div>

                    <span className="text-[12px] font-vazirmatn font-medium text-slate-500">
                      {total} تست
                    </span>
                  </div>

                  {/* Parts */}
                  <div className="grid grid-cols-1 gap-1.5 2xl:gap-1">
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
          <footer className="mt-3 flex font-vazirmatn items-center justify-between px-2 text-[9px] text-slate-600">
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