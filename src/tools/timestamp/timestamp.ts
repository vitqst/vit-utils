export type TimestampUnit = "auto" | "seconds" | "milliseconds";

export interface TimestampResult {
  seconds: number;
  milliseconds: number;
  iso: string;
  utc: string;
  local: string;
  detectedUnit: Exclude<TimestampUnit, "auto">;
}

function resultFromMilliseconds(
  milliseconds: number,
  detectedUnit: Exclude<TimestampUnit, "auto">,
): TimestampResult {
  const date = new Date(milliseconds);
  if (!Number.isFinite(milliseconds) || Number.isNaN(date.getTime())) {
    throw new Error("Timestamp is outside the supported JavaScript date range.");
  }
  return {
    seconds: milliseconds / 1000,
    milliseconds,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toLocaleString(),
    detectedUnit,
  };
}

export function parseUnixTimestamp(
  input: string,
  unit: TimestampUnit,
): TimestampResult {
  if (!input.trim()) throw new Error("Enter a Unix timestamp.");
  const value = Number(input);
  if (!Number.isFinite(value)) throw new Error("Enter a valid finite timestamp.");

  const detectedUnit =
    unit === "auto"
      ? Math.abs(value) >= 100_000_000_000
        ? "milliseconds"
        : "seconds"
      : unit;
  return resultFromMilliseconds(
    detectedUnit === "seconds" ? value * 1000 : value,
    detectedUnit,
  );
}

export function dateTimeToTimestamp(input: string) {
  const match = input.match(
    /^(\d{4,6})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!match) throw new Error("Enter a valid local date and time.");

  const [, yearText, monthText, dayText, hourText, minuteText, secondText] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText ?? 0);
  const date = new Date(year, month - 1, day, hour, minute, second, 0);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute ||
    date.getSeconds() !== second
  ) {
    throw new Error("Enter a real local date and time.");
  }

  const milliseconds = date.getTime();
  return {
    seconds: milliseconds / 1000,
    milliseconds,
    iso: date.toISOString(),
  };
}

