"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface LivelyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
}

export default function LivelyButton({
  children,
  icon,
  className = "",
  ...props
}: LivelyButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-shadow hover:shadow-xl hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {/* Animated shine */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
        animate={{ x: ["-100%", "200%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 2.5,
          ease: "linear",
        }}
        style={{
          width: "50%",
          transform: "skewX(-20deg)",
        }}
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon && <span>{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
}