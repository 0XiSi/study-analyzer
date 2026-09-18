"use client";

import {useMemo} from "react";
import {
    CalendarDays,
    ChevronDown,
    Clock3,
    FileText,
} from "lucide-react";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {formatDuration} from "@/app/lib/formatting";
import {AnalysisStats, DayAnalysis} from "@/app/lib/statistics";

type Session = {
    name: string;
    start: Date;
    end: Date;
    durationSeconds: number;
    notes?: string;
};

type Props = {
    sessions: Session[],
    dailyStats?: AnalysisStats["daily"]
};

export function SessionTable({sessions, dailyStats}: Props) {
    const sortedSessions = useMemo(
        () =>
            [...sessions].sort(
                (a, b) => b.start.getTime() - a.start.getTime()
            ),
        [sessions]
    );

    const sessionsByDay = useMemo(() => {
        const groups = new Map<string, Session[]>();

        for (const session of sortedSessions) {
            const key = [
                session.start.getFullYear(),
                session.start.getMonth(),
                session.start.getDate(),
            ].join("-");

            const existing = groups.get(key);

            if (existing) {
                existing.push(session);
            } else {
                groups.set(key, [session]);
            }
        }

        return Array.from(groups.entries());
    }, [sortedSessions]);

    const formatDay = (date: Date) =>
        new Intl.DateTimeFormat("fa-IR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 p-5">
                <h2 className="text-lg font-semibold text-slate-100">
                    جلسات مطالعه
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    {sessions.length.toLocaleString("fa-IR")} جلسه
                </p>
            </div>

            {sessionsByDay.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-500">
                    هیچ جلسه‌ای برای نمایش وجود ندارد.
                </div>
            ) : (
                <div className="max-h-[500px] overflow-auto">
                    <Accordion
                        multiple={true}
                        className="w-full"
                    >
                        {sessionsByDay.map(([dayKey, daySessions]) => {
                            const date = daySessions[0].start;

                            const totalDuration = daySessions.reduce(
                                (total, session) =>
                                    total + session.durationSeconds,
                                0
                            );

                            return (
                                <AccordionItem
                                    key={dayKey}
                                    value={dayKey}
                                    className="border-b border-slate-800 px-5 last:border-b-0"
                                >
                                    <AccordionTrigger className="py-4 hover:no-underline">
                                        <div className="flex min-w-0 flex-1 items-center gap-4 text-right">
                                            <div
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                                                <CalendarDays
                                                    size={17}
                                                    className="text-slate-400"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium text-slate-200">
                                                    {formatDay(date)}
                                                </div>

                                                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <span>
                            {daySessions.length.toLocaleString(
                                "fa-IR"
                            )}{" "}
                              پارت
                          </span>

                                                    <span>•</span>

                                                    <span>
                            {formatDuration(totalDuration)}
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="pb-4">
                                        <div
                                            className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
                                            {daySessions.map((session, index) => (
                                                <div
                                                    key={`${session.start.getTime()}-${session.name}-${index}`}
                                                    className="flex flex-col gap-3 border-b border-slate-800/70 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center"
                                                >
                                                    {/* Time */}
                                                    <div
                                                        className="flex w-30 shrink-0 items-center gap-2 text-sm text-slate-400">
                                                        <Clock3
                                                            size={14}
                                                            className="text-slate-600"
                                                        />

                                                        <span>
                              {session.start.toLocaleTimeString(
                                  "fa-IR",
                                  {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  }
                              )}
                            </span>
                                                        <span>
                            تا{" "}
                                                            {session.end.toLocaleTimeString(
                                                                "fa-IR",
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                              </span>
                                                    </div>

                                                    {/* Tag */}
                                                    <div className="min-w-0 flex-1">
                            <span
                                className="inline-flex rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200">
                              {session.name}
                            </span>

                                                        {session.notes && (
                                                            <div className="mt-2 flex min-w-0 items-center gap-2">
                                                                <FileText
                                                                    size={13}
                                                                    className="shrink-0 text-slate-600"
                                                                />

                                                                <span className="truncate text-xs text-slate-500">
                                  {session.notes}
                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* End */}
                                                    <div className="text-xs text-slate-600">

                                                    </div>

                                                    {/* Duration */}
                                                    <div
                                                        className="flex w-24 shrink-0 items-center justify-end gap-2 text-sm font-medium text-slate-200">
                                                        <Clock3
                                                            size={14}
                                                            className="text-slate-600"
                                                        />

                                                        {formatDuration(
                                                            session.durationSeconds
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </div>
            )}
        </section>
    );
}
