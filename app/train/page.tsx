"use client";

import { useMemo, useState } from "react";

type Element = {
  z: number;
  symbol: string;
  name: string;
};

const elements: Element[] = [
  { z: 1, symbol: "H", name: "هیدروژن" },
  { z: 2, symbol: "He", name: "هلیم" },
  { z: 3, symbol: "Li", name: "لیتیم" },
  { z: 4, symbol: "Be", name: "بریلیم" },
  { z: 5, symbol: "B", name: "بور" },
  { z: 6, symbol: "C", name: "کربن" },
  { z: 7, symbol: "N", name: "نیتروژن" },
  { z: 8, symbol: "O", name: "اکسیژن" },
  { z: 9, symbol: "F", name: "فلوئور" },
  { z: 10, symbol: "Ne", name: "نئون" },
  { z: 11, symbol: "Na", name: "سدیم" },
  { z: 12, symbol: "Mg", name: "منیزیم" },
  { z: 13, symbol: "Al", name: "آلومینیوم" },
  { z: 14, symbol: "Si", name: "سیلیسیم" },
  { z: 15, symbol: "P", name: "فسفر" },
  { z: 16, symbol: "S", name: "گوگرد" },
  { z: 17, symbol: "Cl", name: "کلر" },
  { z: 18, symbol: "Ar", name: "آرگون" },
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
];

type Mode = "forward" | "reverse";

export default function Page() {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("forward");
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  const current = elements[index];

  const progress = useMemo(
    () => ((index + 1) / elements.length) * 100,
    [index]
  );

  function next(wasCorrect?: boolean) {
    if (wasCorrect === true) setCorrect((v) => v + 1);
    if (wasCorrect === false) setWrong((v) => v + 1);

    setRevealed(false);
    setIndex((v) => (v + 1) % elements.length);
  }

  function changeMode(newMode: Mode) {
    setMode(newMode);
    setIndex(0);
    setRevealed(false);
    setCorrect(0);
    setWrong(0);
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#09090b] text-zinc-100"
    >
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-3 py-5 sm:px-5">

        {/* Header */}
        <header className="mb-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-1 text-xs font-bold text-indigo-400">
                شیمی • بازیابی فعال
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                زنجیره‌ی ۱ تا ۳۶
              </h1>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-center">
              <div className="text-xl font-black">
                {index + 1}
                <span className="text-xs text-zinc-600">
                  /36
                </span>
              </div>
              <div className="text-[9px] font-bold text-zinc-600">
                عنصر
              </div>
            </div>
          </div>

          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        {/* Mode */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl border border-zinc-800 bg-zinc-950 p-1">
          <button
            onClick={() => changeMode("forward")}
            className={`rounded-xl py-2.5 text-xs font-bold transition ${
              mode === "forward"
                ? "bg-indigo-600 text-white"
                : "text-zinc-500 hover:bg-zinc-900"
            }`}
          >
            عدد → عنصر
          </button>

          <button
            onClick={() => changeMode("reverse")}
            className={`rounded-xl py-2.5 text-xs font-bold transition ${
              mode === "reverse"
                ? "bg-indigo-600 text-white"
                : "text-zinc-500 hover:bg-zinc-900"
            }`}
          >
            عنصر → عدد
          </button>
        </div>

        {/* Question Card */}
        <section>
          <div className="relative flex min-h-[330px] flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-zinc-800 bg-zinc-950 p-6 text-center">

            {mode === "forward" ? (
              <>
                <span className="text-xs font-bold text-zinc-600">
                  عدد اتمی
                </span>

                <div className="mt-3 text-7xl font-black tracking-tighter text-white">
                  {current.z}
                </div>

                <p className="mt-4 text-xs text-zinc-600">
                  عنصر مربوط به این عدد را به یاد بیاور
                </p>
              </>
            ) : (
              <>
                <span className="text-xs font-bold text-zinc-600">
                  عنصر
                </span>

                <div className="mt-3 text-7xl font-black tracking-tighter text-white">
                  {current.symbol}
                </div>

                <div className="mt-2 text-base font-bold text-zinc-400">
                  {current.name}
                </div>

                <p className="mt-4 text-xs text-zinc-600">
                  عدد اتمی را از حافظه پیدا کن
                </p>
              </>
            )}

            {/* Answer */}
            {revealed && (
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3">
                <div className="text-[10px] font-bold text-indigo-400">
                  پاسخ
                </div>

                {mode === "forward" ? (
                  <div className="mt-1">
                    <span className="text-xl font-black text-white">
                      {current.symbol}
                    </span>

                    <span className="mx-2 text-zinc-700">
                      •
                    </span>

                    <span className="text-xs font-bold text-zinc-400">
                      {current.name}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 text-xl font-black text-white">
                    {current.z}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-3">
            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="w-full rounded-2xl bg-white py-3.5 text-xs font-black text-zinc-950 transition hover:bg-zinc-200 active:scale-[0.99]"
              >
                نمایش پاسخ
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => next(false)}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 py-3.5 text-xs font-black text-red-400 transition hover:bg-red-500/15"
                >
                  ✕ بلد نبودم
                </button>

                <button
                  onClick={() => next(true)}
                  className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 py-3.5 text-xs font-black text-emerald-400 transition hover:bg-emerald-500/15"
                >
                  ✓ بلد بودم
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-2.5 text-center">
            <div className="text-lg font-black text-emerald-400">
              {correct}
            </div>
            <div className="text-[9px] font-bold text-zinc-600">
              درست
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-2.5 text-center">
            <div className="text-lg font-black text-red-400">
              {wrong}
            </div>
            <div className="text-[9px] font-bold text-zinc-600">
              غلط
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-2.5 text-center">
            <div className="text-lg font-black text-zinc-300">
              {correct + wrong}
            </div>
            <div className="text-[9px] font-bold text-zinc-600">
              پاسخ داده‌شده
            </div>
          </div>
        </div>

        {/* Sequence */}
        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-black text-zinc-300">
              موقعیت در زنجیره
            </span>

            <span className="text-[9px] font-bold text-zinc-600">
              ۱ ← ۳۶
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {elements.map((element, i) => (
              <button
                key={element.z}
                onClick={() => {
                  setIndex(i);
                  setRevealed(false);
                }}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-[9px] font-black transition ${
                  i === index
                    ? "bg-indigo-600 text-white"
                    : i < index
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "bg-zinc-900 text-zinc-600 hover:bg-zinc-800"
                }`}
              >
                {element.z}
              </button>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-center text-[10px] leading-5 text-zinc-500">
          💡 اول پاسخ را در ذهنت بگو، بعد «نمایش پاسخ» را بزن.
          <strong className="text-zinc-300">
            {" "}هدف بازیابی است، نه صرفاً دیدن جواب.
          </strong>
        </div>
      </div>
    </main>
  );
}
