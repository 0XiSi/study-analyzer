"use client";

import { useMemo, useState } from "react";

import { FileUploader } from "@/app/components/FileUploader";
import { StatsGrid } from "@/app/components/StatsGrid";
import { TagFilter } from "@/app/components/TagFilter";
import { TagStatistics } from "@/app/components/TagStatistics";
import { SessionTable } from "@/app/components/SessionTable";

import { parseCSV } from "@/app/lib/parser";
import { calculateStats } from "@/app/lib/statistics";

import type { Session } from "@/app/lib/types";

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [excludedTags, setExcludedTags] = useState<string[]>([]);

  const filteredSessions = useMemo(
    () =>
      sessions.filter(
        (session) => !excludedTags.includes(session.name)
      ),
    [sessions, excludedTags]
  );

  const stats = useMemo(
    () => calculateStats(filteredSessions),
    [filteredSessions]
  );

  function handleFile(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      const content = String(reader.result ?? "");

      if (file.name.toLowerCase().endsWith(".csv")) {
        setSessions(parseCSV(content));
      }

      // Reset excluded tags when a new file is loaded
      setExcludedTags([]);
    };

    reader.readAsText(file);
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 text-slate-100 font-vazirmatn"
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        {sessions.length === 0 ? (
          <FileUploader onFile={handleFile} />
        ) : (
          <>
            <TagFilter
              sessions={sessions}
              excludedTags={excludedTags}
              onChange={setExcludedTags}
            />

            <StatsGrid stats={stats} />

            <TagStatistics
              sessions={filteredSessions}
              totalSeconds={stats.totalSeconds}
            />


            <SessionTable
              sessions={filteredSessions}
              dailyStats={stats.daily}
            />

          </>
        )}
      </div>
    </main>
  );
}