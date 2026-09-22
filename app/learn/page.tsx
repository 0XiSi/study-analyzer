"use client";

import { useState } from "react";

type Element = {
  z: number;
  symbol: string;
  name: string;
};

const periods: { period: number; elements: Element[] }[] = [
  {
    period: 1,
    elements: [
      { z: 1, symbol: "H", name: "هیدروژن" },
      { z: 2, symbol: "He", name: "هلیم" },
    ],
  },
  {
    period: 2,
    elements: [
      { z: 3, symbol: "Li", name: "لیتیم" },
      { z: 4, symbol: "Be", name: "بریلیم" },
      { z: 5, symbol: "B", name: "بور" },
      { z: 6, symbol: "C", name: "کربن" },
      { z: 7, symbol: "N", name: "نیتروژن" },
      { z: 8, symbol: "O", name: "اکسیژن" },
      { z: 9, symbol: "F", name: "فلوئور" },
      { z: 10, symbol: "Ne", name: "نئون" },
    ],
  },
  {
    period: 3,
    elements: [
      { z: 11, symbol: "Na", name: "سدیم" },
      { z: 12, symbol: "Mg", name: "منیزیم" },
      { z: 13, symbol: "Al", name: "آلومینیوم" },
      { z: 14, symbol: "Si", name: "سیلیسیم" },
      { z: 15, symbol: "P", name: "فسفر" },
      { z: 16, symbol: "S", name: "گوگرد" },
      { z: 17, symbol: "Cl", name: "کلر" },
      { z: 18, symbol: "Ar", name: "آرگون" },
    ],
  },
  {
    period: 4,
    elements: [
      { z: 19, symbol: "K", name: "پتاسیم" },
      { z: 20, symbol: "Ca", name: "کلسیم" },
      { z: 21, symbol: "Sc", name: "اسکاندیم" },
      { z: 22, symbol: "Ti", name: "تیتانیم" },
      { z: 23, symbol: "V", name: "وانادیم" },
      { z: 24, symbol: "Cr", name: "کروم" },
      { z: 25, symbol: "Mn", name: "منگنز" },
      { z: 26, symbol: "Fe", name: "آهن" },
      { z: 27, symbol: "Co", name: "کبالت" },
      { z: 28, symbol: "Ni", name: "نیکل" },
      { z: 29, symbol: "Cu", name: "مس" },
      { z: 30, symbol: "Zn", name: "روی" },
      { z: 31, symbol: "Ga", name: "گالیم" },
      { z: 32, symbol: "Ge", name: "ژرمانیم" },
      { z: 33, symbol: "As", name: "آرسنیک" },
      { z: 34, symbol: "Se", name: "سلنیم" },
      { z: 35, symbol: "Br", name: "برم" },
      { z: 36, symbol: "Kr", name: "کریپتون" },
    ],
  },
];

export default function Page() {
  const [showNames, setShowNames] = useState(true);
  const [showNumbers, setShowNumbers] = useState(true);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#09090b] text-zinc-100"
    >
      <div className="mx-auto max-w-6xl px-3 py-5 sm:px-5">

        {/* Header */}
        <header className="mb-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                شیمی • عناصر ۱ تا ۳۶
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                نقشه‌ی عناصر
              </h1>

              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                دوره‌ها را به صورت یک زنجیره در ذهن بساز.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowNumbers(!showNumbers)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  showNumbers
                    ? "border-indigo-500/30 bg-indigo-500/15 text-indigo-400"
                    : "border-zinc-800 bg-zinc-900 text-zinc-500"
                }`}
              >
                عدد اتمی
              </button>

              <button
                onClick={() => setShowNames(!showNames)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  showNames
                    ? "border-indigo-500/30 bg-indigo-500/15 text-indigo-400"
                    : "border-zinc-800 bg-zinc-900 text-zinc-500"
                }`}
              >
                نام
              </button>
            </div>
          </div>
        </header>

        {/* Periods */}
        <div className="space-y-3">
          {periods.map((period) => (
            <section
              key={period.period}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
            >
              {/* Period header */}
              <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-[11px] font-black text-indigo-400">
                    {period.period}
                  </span>

                  <span className="text-xs font-bold text-zinc-300">
                    دوره {period.period}
                  </span>
                </div>

                <span className="text-[10px] font-bold text-zinc-600">
                  {period.elements.length} عنصر
                </span>
              </div>

              {/* Elements */}
              <div
                  dir="ltr"
                className={`grid gap-1.5 p-2 items-start ${
                  period.period <= 3
                    ? "grid-cols-4 sm:grid-cols-8"
                    : "grid-cols-6 sm:grid-cols-9 lg:grid-cols-[repeat(18,minmax(0,1fr))]"
                }`}
              >
                {period.elements.map((element) => (
                  <div
                    key={element.z}
                    className="group relative flex min-h-[58px] flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/70 px-1 py-1.5 transition hover:border-indigo-500/40 hover:bg-indigo-500/10"
                  >
                    {showNumbers && (
                      <span className="absolute right-1 top-0.5 text-[8px] font-bold text-zinc-600">
                        {element.z}
                      </span>
                    )}

                    {/* Smaller symbol */}
                    <span className="text-base font-black leading-none text-zinc-100 sm:text-lg">
                      {element.symbol}
                    </span>

                    {showNames && (
                      <span className="mt-1 max-w-full truncate text-[8px] font-medium text-zinc-500 sm:text-[9px]">
                        {element.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Memory rule */}
        <div className="mt-4 rounded-2xl border border-indigo-500/15 bg-indigo-500/5 p-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-sm">
              🧠
            </div>

            <div>
              <h3 className="text-xs font-black text-indigo-300">
                قانون حفظ
              </h3>

              <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                هر دوره را یک زنجیره ببین. با حرکت از چپ به راست، عدد اتمی
                یکی‌یکی افزایش پیدا می‌کند.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}