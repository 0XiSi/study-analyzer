
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, MotionConfig } from 'motion/react';

const navItems = [
  { href: '/', label: 'نمایشگر برنامه' },
  { href: '/planner', label: 'برنامه‌ریز' },
  { href: '/analyze', label: 'روند مطالعه' },
  { href: '/train', label: 'تمرین جدول تناوبی' },
  { href: '/learn', label: 'حفظ جدول تناوبی' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <MotionConfig reducedMotion="user">
      <header
        className="
          fixed inset-x-0 bottom-0 z-50 w-full
          px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]
          sm:sticky sm:top-3 sm:bottom-auto
          sm:px-6 sm:pb-0
        "
      >
        <nav
          dir="rtl"
          aria-label="ناوبری اصلی"
          className="
            mx-auto flex w-fit max-w-full flex-wrap
            items-center justify-center gap-1 sm:gap-2
            rounded-2xl border border-white/10
            bg-background/80 p-2
            shadow-lg shadow-black/10
            backdrop-blur-xl backdrop-saturate-150
          "
        >
          {navItems.map(({ href, label }) => {
            const active =
              pathname === href ||
              (href !== '/' && pathname.startsWith(`${href}/`));

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`
                  relative isolate rounded-xl px-3 py-2.5
                  text-sm font-medium whitespace-nowrap
                  transition-colors duration-200 sm:px-4
                  ${
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {active && (
                  <motion.span
                    layoutId="active-nav-indicator"
                    className="absolute inset-0 -z-10 rounded-xl
                               bg-primary/10 ring-2 ring-primary/20"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                <motion.span
                  className="relative block font-vazirmatn"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  {label}
                </motion.span>
              </Link>
            );
          })}
        </nav>
      </header>
    </MotionConfig>
  );
}