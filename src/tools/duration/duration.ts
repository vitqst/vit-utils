export type DurationInputUnit = "milliseconds" | "seconds" | "clock";

export function parseDuration(input: string, unit: DurationInputUnit) {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Enter a duration.");

  if (unit !== "clock") {
    const value = Number(trimmed);
    if (!Number.isFinite(value)) throw new Error("Enter a finite duration.");
    return unit === "seconds" ? value * 1000 : value;
  }

  const negative = trimmed.startsWith("-");
  const unsigned =
    trimmed.startsWith("-") || trimmed.startsWith("+")
      ? trimmed.slice(1)
      : trimmed;
  const parts = unsigned.split(":");
  if (parts.length < 2 || parts.length > 4) {
    throw new Error(
      "Use MM:SS, HH:MM:SS, or days:HH:MM:SS clock notation.",
    );
  }
  if (
    parts.some((part, index) =>
      index === parts.length - 1
        ? !/^\d+(?:\.\d+)?$/.test(part)
        : !/^\d+$/.test(part),
    )
  ) {
    throw new Error("Clock notation contains an invalid number.");
  }

  const values = parts.map(Number);
  const seconds = values.at(-1) ?? 0;
  const minutes = values.at(-2) ?? 0;
  if (seconds >= 60 || minutes >= 60) {
    throw new Error("Minute and second fields must be below 60.");
  }

  let totalSeconds: number;
  if (values.length === 2) {
    totalSeconds = minutes * 60 + seconds;
  } else if (values.length === 3) {
    const [hours] = values;
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
  } else {
    const [days, hours] = values;
    if (hours >= 24) {
      throw new Error("The hour field must be below 24 when days are present.");
    }
    totalSeconds = days * 86_400 + hours * 3600 + minutes * 60 + seconds;
  }
  return (negative ? -1 : 1) * totalSeconds * 1000;
}

export function formatClockDuration(milliseconds: number) {
  if (!Number.isFinite(milliseconds)) throw new Error("Duration must be finite.");
  const negative = milliseconds < 0;
  let remaining = Math.round(Math.abs(milliseconds));
  const days = Math.floor(remaining / 86_400_000);
  remaining %= 86_400_000;
  const hours = Math.floor(remaining / 3_600_000);
  remaining %= 3_600_000;
  const minutes = Math.floor(remaining / 60_000);
  remaining %= 60_000;
  const seconds = Math.floor(remaining / 1000);
  const millis = remaining % 1000;
  const pad = (value: number, length = 2) =>
    String(value).padStart(length, "0");
  const clock = days
    ? `${days}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(millis, 3)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(millis, 3)}`;
  return `${negative ? "-" : ""}${clock}`;
}

export function humanizeDuration(
  milliseconds: number,
  locale: "en" | "vi",
) {
  if (!Number.isFinite(milliseconds)) throw new Error("Duration must be finite.");
  const negative = milliseconds < 0;
  let remaining = Math.round(Math.abs(milliseconds));
  const units = [
    [86_400_000, "day", "ngày"],
    [3_600_000, "hour", "giờ"],
    [60_000, "minute", "phút"],
    [1000, "second", "giây"],
    [1, "millisecond", "mili giây"],
  ] as const;
  const parts: string[] = [];
  for (const [size, english, vietnamese] of units) {
    const value = Math.floor(remaining / size);
    remaining %= size;
    if (value || (!parts.length && size === 1)) {
      parts.push(
        locale === "vi"
          ? `${value} ${vietnamese}`
          : `${value} ${english}${value === 1 ? "" : "s"}`,
      );
    }
  }
  return `${negative ? "-" : ""}${parts.join(", ")}`;
}

