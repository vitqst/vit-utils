const DAY_MILLISECONDS = 86_400_000;
const MAX_RANGE_DAYS = 20_000;

function parseDate(input: string) {
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error(`Invalid ISO date: ${input || "(empty)"}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const milliseconds = Date.UTC(year, month - 1, day);
  const date = new Date(milliseconds);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid Gregorian date: ${input}`);
  }
  return milliseconds;
}

export function countWorkingDays(
  startInput: string,
  endInput: string,
  weekendWeekdays: number[],
  holidayInputs: string[],
) {
  if (
    weekendWeekdays.some(
      (weekday) => !Number.isInteger(weekday) || weekday < 0 || weekday > 6,
    )
  ) {
    throw new Error("Weekend weekdays must be integers from 0 through 6.");
  }
  const weekend = new Set(weekendWeekdays);
  const startValue = parseDate(startInput);
  const endValue = parseDate(endInput);
  const sign = startValue === endValue ? 0 : startValue < endValue ? 1 : -1;
  const rangeStart = Math.min(startValue, endValue);
  const rangeEnd = Math.max(startValue, endValue);
  const totalDays =
    Math.round((rangeEnd - rangeStart) / DAY_MILLISECONDS) + 1;
  if (totalDays > MAX_RANGE_DAYS) {
    throw new Error("Date range cannot exceed 20,000 inclusive days.");
  }

  const holidays = new Set(
    holidayInputs
      .map((holiday) => holiday.trim())
      .filter(Boolean)
      .map((holiday) => new Date(parseDate(holiday)).toISOString().slice(0, 10)),
  );
  let workingDays = 0;
  let weekendDays = 0;
  let holidayDays = 0;

  for (
    let value = rangeStart;
    value <= rangeEnd;
    value += DAY_MILLISECONDS
  ) {
    const date = new Date(value);
    const iso = date.toISOString().slice(0, 10);
    if (holidays.has(iso)) holidayDays += 1;
    else if (weekend.has(date.getUTCDay())) weekendDays += 1;
    else workingDays += 1;
  }

  return { sign, totalDays, workingDays, weekendDays, holidayDays };
}

