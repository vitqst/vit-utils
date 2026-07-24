interface WallTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const COMMON_ZONES = [
  "UTC",
  "Asia/Ho_Chi_Minh",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Australia/Sydney",
] as const;

function assertTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(0);
  } catch {
    throw new Error(`Invalid IANA time zone: ${timeZone}`);
  }
}

function parseWallTime(input: string): WallTime {
  const match = input.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (!match) throw new Error("Enter a valid local date and time.");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? 0);
  const check = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day ||
    check.getUTCHours() !== hour ||
    check.getUTCMinutes() !== minute ||
    check.getUTCSeconds() !== second
  ) {
    throw new Error("Enter a real local date and time.");
  }
  return { year, month, day, hour, minute, second };
}

function wallTimeAt(instant: number, timeZone: string): WallTime {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(instant));
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

function wallMilliseconds(wall: WallTime) {
  return Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
  );
}

function sameWallTime(left: WallTime, right: WallTime) {
  return (
    left.year === right.year &&
    left.month === right.month &&
    left.day === right.day &&
    left.hour === right.hour &&
    left.minute === right.minute &&
    left.second === right.second
  );
}

export function resolveZonedDateTime(input: string, timeZone: string) {
  assertTimeZone(timeZone);
  const desired = parseWallTime(input);
  const desiredMilliseconds = wallMilliseconds(desired);
  let candidate = desiredMilliseconds;

  for (let iteration = 0; iteration < 4; iteration += 1) {
    const represented = wallMilliseconds(wallTimeAt(candidate, timeZone));
    candidate += desiredMilliseconds - represented;
  }

  const matches: number[] = [];
  const searchStart = candidate - 4 * 60 * 60 * 1000;
  const searchEnd = candidate + 4 * 60 * 60 * 1000;
  for (
    let instant = searchStart;
    instant <= searchEnd;
    instant += 15 * 60 * 1000
  ) {
    if (sameWallTime(wallTimeAt(instant, timeZone), desired)) {
      matches.push(instant);
    }
  }

  if (!matches.length) {
    throw new Error(
      "That local time does not exist in the selected time zone, usually because of a daylight-saving transition.",
    );
  }
  const instant = Math.min(...matches);
  return {
    instant: new Date(instant),
    iso: new Date(instant).toISOString(),
    ambiguous: new Set(matches).size > 1,
  };
}

function offsetName(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(instant);
  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone;
}

export function getSupportedTimeZones() {
  const supportedValuesOf = (
    Intl as typeof Intl & {
      supportedValuesOf?: (key: "timeZone") => string[];
    }
  ).supportedValuesOf;
  const available = supportedValuesOf?.("timeZone") ?? [];
  return [...new Set([...COMMON_ZONES, ...available])].sort();
}

export function convertTimeZones(
  input: string,
  sourceZone: string,
  targetZones: string[],
  locale: "en" | "vi",
) {
  if (!targetZones.length) throw new Error("Choose at least one target zone.");
  const resolved = resolveZonedDateTime(input, sourceZone);
  const localeId = locale === "vi" ? "vi-VN" : "en-US";
  const targets = targetZones.map((zone) => {
    assertTimeZone(zone);
    return {
      zone,
      offset: offsetName(resolved.instant, zone),
      formatted: new Intl.DateTimeFormat(localeId, {
        timeZone: zone,
        dateStyle: "medium",
        timeStyle: "long",
      }).format(resolved.instant),
    };
  });
  return {
    iso: resolved.iso,
    ambiguous: resolved.ambiguous,
    targets,
  };
}
