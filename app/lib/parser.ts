import type { Session } from "./types";

function parseDuration(value: string): number {
  const parts = value.trim().split(":").map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return 0;
  }

  const [hours, minutes, seconds] = parts;

  return hours * 3600 + minutes * 60 + seconds;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];

  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());

  return result;
}

export function parseCSV(csv: string): Session[] {
  const lines = csv
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCSVLine(lines[0]).map((header) =>
    header.trim().toLowerCase()
  );

  const nameIndex = headers.indexOf("name");
  const startIndex = headers.indexOf("start");
  const endIndex = headers.indexOf("end");
  const durationIndex = headers.indexOf("duration");
  const notesIndex = headers.indexOf("notes");
  const billableIndex = headers.indexOf("billable");

  if (
    nameIndex === -1 ||
    startIndex === -1 ||
    endIndex === -1 ||
    durationIndex === -1
  ) {
    throw new Error(
      "CSV باید ستون‌های Name، Start، End و Duration را داشته باشد."
    );
  }

  return lines.slice(1).flatMap((line) => {
    const cells = parseCSVLine(line);

    const name = cells[nameIndex]?.trim();
    const start = new Date(cells[startIndex]?.trim());
    const end = new Date(cells[endIndex]?.trim());

    if (
      !name ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return [];
    }

    return [
      {
        name,
        start,
        end,
        durationSeconds: parseDuration(
          cells[durationIndex] ?? ""
        ),
        notes: cells[notesIndex]?.trim() ?? "",
        billable: cells[billableIndex]?.trim() ?? "",
      },
    ];
  });
}