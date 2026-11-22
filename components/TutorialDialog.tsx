"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

export default function FirstVisitDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("hasSeenDialog")) {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDialog();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function closeDialog() {
    localStorage.setItem("hasSeenDialog", "true");
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
            onClick={closeDialog}
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-title"
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-white p-7 shadow-2xl dark:bg-slate-900"
            initial={{ opacity: 0, y: 35, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 24,
            }}
          >
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-2xl shadow-lg shadow-blue-500/25">
                ✨
              </div>

              <h2
                id="welcome-title"
                className="mb-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
              >
                خوش آمدید
              </h2>

              <p className="mb-7 leading-7 text-slate-600 dark:text-slate-300">
                 شما میتوانید برای برنامه ریزی تست زنی از این سایت کمک بگیرید
              </p>
              <Link href={"https://www.aparat.com/v/nuc77z5"} target="_blank">
              <button
                onClick={closeDialog}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/40 active:scale-[0.98]"
              >
                آموزش استفاده
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}