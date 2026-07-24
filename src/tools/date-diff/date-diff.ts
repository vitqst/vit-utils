const DAY_MILLISECONDS = 86_400_000;

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function parseDateOnly(input: string): DateParts {
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error("Enter a date in YYYY-MM-DD format.");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Enter a real Gregorian date.");
  }
  return { year, month, day };
}

function toMilliseconds(date: DateParts) {
  return Date.UTC(date.year, date.month - 1, date.day);
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addYearsClamped(date: DateParts, years: number): DateParts {
  const year = date.year + years;
  return {
    year,
    month: date.month,
    day: Math.min(date.day, daysInMonth(year, date.month)),
  };
}

function addMonthsClamped(date: DateParts, months: number): DateParts {
  const total = date.year * 12 + date.month - 1 + months;
  const year = Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12 + 1;
  return {
    year,
    month,
    day: Math.min(date.day, daysInMonth(year, month)),
  };
}

export function calculateDateDifference(startInput: string, endInput: string) {
  const first = parseDateOnly(startInput);
  const second = parseDateOnly(endInput);
  const firstMilliseconds = toMilliseconds(first);
  const secondMilliseconds = toMilliseconds(second);
  const sign =
    firstMilliseconds === secondMilliseconds
      ? 0
      : firstMilliseconds < secondMilliseconds
        ? 1
        : -1;
  const start = sign >= 0 ? first : second;
  const end = sign >= 0 ? second : first;
  const startMilliseconds = toMilliseconds(start);
  const endMilliseconds = toMilliseconds(end);

  let years = end.year - start.year;
  let cursor = addYearsClamped(start, years);
  if (toMilliseconds(cursor) > endMilliseconds) {
    years -= 1;
    cursor = addYearsClamped(start, years);
  }

  let months =
    (end.year - cursor.year) * 12 + (end.month - cursor.month);
  let monthCursor = addMonthsClamped(cursor, months);
  if (toMilliseconds(monthCursor) > endMilliseconds) {
    months -= 1;
    monthCursor = addMonthsClamped(cursor, months);
  }
  const days = Math.round(
    (endMilliseconds - toMilliseconds(monthCursor)) / DAY_MILLISECONDS,
  );
  const totalDays = Math.round(
    (endMilliseconds - startMilliseconds) / DAY_MILLISECONDS,
  );

  return {
    sign,
    years,
    months,
    days,
    totalDays,
    weeks: Math.floor(totalDays / 7),
    remainingDays: totalDays % 7,
    elapsedMilliseconds:
      (secondMilliseconds - firstMilliseconds),
  };
}

