"use client";

import { Upload } from "lucide-react";

type Props = {
  onFile: (file: File) => void;
};

export function FileUploader({ onFile }: Props) {
  return (
    <label className="group flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-700 bg-slate-900/70 transition hover:border-slate-500">
      <input
        type="file"
        accept=".csv,.md,text/csv,text/markdown"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file) {
            onFile(file);
          }
        }}
      />

      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-400 transition group-hover:text-indigo-400">
        <Upload size={30} />
      </div>

      <h2 className="text-lg font-semibold">
        فایل مطالعه را اینجا رها کنید
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        CSV یا Markdown
      </p>
    </label>
  );
}