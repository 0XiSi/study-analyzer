"use client";

import {
    FlaskConical,
    Grid2X2,
    Hash,
    Sigma, Triangle,
    Zap,
} from "lucide-react";

type Subject =
  | "calculus"
  | "math1"
  | "chemistry"
  | "geometry1"
  | "geometry3"
  | "physics"
  | "discrete";

type Part = {
  subject: Subject;
  from: number;
  to: number;
  count: number;
  step?: number;
};

const subjects: Record<
  Subject,
  {
    name: string;
    icon: typeof Sigma;
    className: string;
    iconClassName: string;
  }
> = {
  calculus: {
    name: "حسابان ۲",
    icon: Sigma,
    className: "border-violet-500/20 bg-violet-500/[0.06]",
    iconClassName: "bg-violet-500/10 text-violet-300",
  },
  math1: {
    name: "ریاضی ۱",
    icon: Sigma,
    className: "border-blue-500/20 bg-blue-500/[0.06]",
    iconClassName: "bg-blue-500/10 text-blue-300",
  },
  chemistry: {
    name: "شیمی ۲",
    icon: FlaskConical,
    className: "border-emerald-500/20 bg-emerald-500/[0.06]",
    iconClassName: "bg-emerald-500/10 text-emerald-300",
  },
  geometry1: {
    name: "هندسه ۱",
    icon: Triangle,
    className: "border-orange-500/20 bg-orange-500/[0.06]",
    iconClassName: "bg-orange-500/10 text-orange-300",
  },
  geometry3: {
    name: "هندسه ۳",
    icon: Grid2X2,
    className: "border-orange-500/20 bg-orange-500/[0.06]",
    iconClassName: "bg-orange-500/10 text-orange-300",
  },
  physics: {
    name: "فیزیک ۲",
    icon: Zap,
    className: "border-cyan-500/20 bg-cyan-500/[0.06]",
    iconClassName: "bg-cyan-500/10 text-cyan-300",
  },
  discrete: {
    name: "گسسته",
    icon: Hash,
    className: "border-pink-500/20 bg-pink-500/[0.06]",
    iconClassName: "bg-pink-500/10 text-pink-300",
  },
};

const days: Part[][] = [
  [
    { subject: "calculus", from: 186, to: 206, step: 2, count: 11 },
    { subject: "chemistry", from: 1, to: 57, step: 4, count: 15 },
    { subject: "geometry3", from: 889, to: 900, count: 12 },
    { subject: "physics", from: 1, to: 29, step: 2, count: 15 },
  ],
  [
    { subject: "math1", from: 3352, to: 3378, step: 2, count: 14 },
    { subject: "chemistry", from: 61, to: 113, step: 4, count: 14 },
    { subject: "geometry3", from: 901, to: 912, count: 12 },
    { subject: "physics", from: 31, to: 57, step: 2, count: 14 },
  ],
  [
    { subject: "math1", from: 3380, to: 3406, step: 2, count: 14 },
    { subject: "chemistry", from: 117, to: 169, step: 4, count: 14 },
    { subject: "geometry3", from: 913, to: 924, count: 12 },
    { subject: "physics", from: 59, to: 85, step: 2, count: 14 },
  ],
  [
    { subject: "calculus", from: 208, to: 226, step: 2, count: 10 },
    { subject: "chemistry", from: 173, to: 225, step: 4, count: 14 },
    { subject: "geometry1", from: 1, to: 18, count: 18 },
    { subject: "physics", from: 87, to: 113, step: 2, count: 14 },
  ],
  [
    { subject: "math1", from: 3408, to: 3434, step: 2, count: 14 },
    { subject: "discrete", from: 1, to: 13, count: 13 },
    { subject: "geometry1", from: 19, to: 36, count: 18 },
    { subject: "physics", from: 115, to: 141, step: 2, count: 14 },
  ],
  [
    { subject: "calculus", from: 228, to: 246, step: 2, count: 10 },
    { subject: "chemistry", from: 229, to: 281, step: 4, count: 14 },
    { subject: "geometry1", from: 37, to: 54, count: 18 },
    { subject: "physics", from: 143, to: 169, step: 2, count: 14 },
  ],
  [
    { subject: "math1", from: 3436, to: 3462, step: 2, count: 14 },
    { subject: "discrete", from: 14, to: 26, count: 13 },
    { subject: "geometry1", from: 55, to: 71, count: 17 },
    { subject: "physics", from: 171, to: 197, step: 2, count: 14 },
  ],
  [
    { subject: "math1", from: 3464, to: 3490, step: 2, count: 14 },
    { subject: "discrete", from: 27, to: 39, count: 13 },
    { subject: "geometry3", from: 925, to: 936, count: 12 },
    { subject: "physics", from: 199, to: 225, step: 2, count: 14 },
  ],
  [
    { subject: "calculus", from: 248, to: 266, step: 2, count: 10 },
    { subject: "chemistry", from: 285, to: 337, step: 4, count: 14 },
    { subject: "geometry1", from: 72, to: 88, count: 17 },
    { subject: "physics", from: 227, to: 253, step: 2, count: 14 },
  ],
  [
    { subject: "math1", from: 3492, to: 3518, step: 2, count: 14 },
    { subject: "discrete", from: 40, to: 52, count: 13 },
    { subject: "geometry1", from: 89, to: 105, count: 17 },
    { subject: "physics", from: 255, to: 281, step: 2, count: 14 },
  ],
];

function Part({ part }: { part: Part }) {
  const subject = subjects[part.subject];
  const Icon = subject.icon;

  return (
    <div
      className={`min-w-0 rounded-xl border px-2.5 py-2 ${subject.className}`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${subject.iconClassName}`}
        >
          <Icon size={14} strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-[11px] font-bold text-slate-200">
              {subject.name}
            </span>

            <span className="shrink-0 rounded-md bg-white/[0.07] px-1.5 py-0.5 text-[10px] font-black text-slate-300">
              {part.count}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[10px] font-medium tabular-nums text-slate-400">
              {part.from} ← {part.to}
            </span>

            {part.step && (
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

export default function Page() {
  const totalTests = days.reduce(
    (total, day) =>
      total + day.reduce((dayTotal, part) => dayTotal + part.count, 0),
    0
  );

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
                برنامه ۱۰ روزه
              </h1>
            </div>

            <div className="text-left">
              <div className="text-lg font-black tabular-nums text-white">
                {totalTests}
              </div>
              <div className="text-[9px] text-slate-500">
                تست در ۱۰ روز
              </div>
            </div>
          </div>
        </header>

        {/* Days */}
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
                {/* Day header */}
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

                {/* Parts */}
                <div className="grid grid-cols-2 gap-1.5">
                  {parts.map((part, partIndex) => (
                    <Part
                      key={`${dayNumber}-${partIndex}`}
                      part={part}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-3 flex items-center justify-between px-2 text-[9px] text-slate-600">
          <span>برنامه تست</span>
          <span>۱۰ روز · {totalTests} تست</span>
        </footer>
      </div>
    </main>
  );
}