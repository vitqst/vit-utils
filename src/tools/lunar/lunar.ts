export interface CalendarDate {
  day: number;
  month: number;
  year: number;
}

export interface LunarDate extends CalendarDate {
  leap: boolean;
}

const TIME_ZONE = 7;
const MIN_YEAR = 1800;
const MAX_YEAR = 2199;
const SYNODIC_MONTH = 29.530588853;
const NEW_MOON_EPOCH = 2415021.076998695;

function assertYear(year: number) {
  if (
    !Number.isInteger(year) ||
    year < MIN_YEAR ||
    year > MAX_YEAR
  ) {
    throw new Error(`Supported years are ${MIN_YEAR} through ${MAX_YEAR}.`);
  }
}

function assertSolarDate(date: CalendarDate) {
  assertYear(date.year);
  const value = new Date(Date.UTC(date.year, date.month - 1, date.day));
  if (
    !Number.isInteger(date.month) ||
    !Number.isInteger(date.day) ||
    value.getUTCFullYear() !== date.year ||
    value.getUTCMonth() !== date.month - 1 ||
    value.getUTCDate() !== date.day
  ) {
    throw new Error("Enter a real Gregorian date.");
  }
}

function julianDayNumber(day: number, month: number, year: number) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let result =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  if (result < 2299161) {
    result =
      day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      32083;
  }
  return result;
}

function dateFromJulianDay(julianDay: number): CalendarDate {
  let a: number;
  let b: number;
  let c: number;
  if (julianDay > 2299160) {
    a = julianDay + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((b * 146097) / 4);
  } else {
    b = 0;
    c = julianDay + 32082;
  }
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);
  return { day, month, year };
}

function newMoon(k: number) {
  const t = k / 1236.85;
  const t2 = t * t;
  const t3 = t2 * t;
  const radians = Math.PI / 180;
  let result =
    2415020.75933 +
    29.53058868 * k +
    0.0001178 * t2 -
    0.000000155 * t3;
  result +=
    0.00033 *
    Math.sin((166.56 + 132.87 * t - 0.009173 * t2) * radians);
  const meanSun =
    359.2242 +
    29.10535608 * k -
    0.0000333 * t2 -
    0.00000347 * t3;
  const meanMoon =
    306.0253 +
    385.81691806 * k +
    0.0107306 * t2 +
    0.00001236 * t3;
  const latitude =
    21.2964 +
    390.67050646 * k -
    0.0016528 * t2 -
    0.00000239 * t3;
  let correction =
    (0.1734 - 0.000393 * t) * Math.sin(meanSun * radians) +
    0.0021 * Math.sin(2 * radians * meanSun);
  correction +=
    -0.4068 * Math.sin(meanMoon * radians) +
    0.0161 * Math.sin(2 * radians * meanMoon) -
    0.0004 * Math.sin(3 * radians * meanMoon);
  correction +=
    0.0104 * Math.sin(2 * radians * latitude) -
    0.0051 * Math.sin(radians * (meanSun + meanMoon)) -
    0.0074 * Math.sin(radians * (meanSun - meanMoon));
  correction +=
    0.0004 * Math.sin(radians * (2 * latitude + meanSun)) -
    0.0004 * Math.sin(radians * (2 * latitude - meanSun)) -
    0.0006 * Math.sin(radians * (2 * latitude + meanMoon));
  correction +=
    0.001 * Math.sin(radians * (2 * latitude - meanMoon)) +
    0.0005 * Math.sin(radians * (2 * meanMoon + meanSun));
  const deltaT =
    t < -11
      ? 0.001 +
        0.000839 * t +
        0.0002261 * t2 -
        0.00000845 * t3 -
        0.000000081 * t * t3
      : -0.000278 + 0.000265 * t + 0.000262 * t2;
  return result + correction - deltaT;
}

function sunLongitude(julianDay: number) {
  const t = (julianDay - 2451545) / 36525;
  const t2 = t * t;
  const radians = Math.PI / 180;
  const meanAnomaly =
    357.5291 + 35999.0503 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
  const meanLongitude =
    280.46645 + 36000.76983 * t + 0.0003032 * t2;
  let delta =
    (1.9146 - 0.004817 * t - 0.000014 * t2) *
    Math.sin(radians * meanAnomaly);
  delta +=
    (0.019993 - 0.000101 * t) *
      Math.sin(2 * radians * meanAnomaly) +
    0.00029 * Math.sin(3 * radians * meanAnomaly);
  const longitude = (meanLongitude + delta) * radians;
  return longitude - Math.PI * 2 * Math.floor(longitude / (Math.PI * 2));
}

function newMoonDay(k: number) {
  return Math.floor(newMoon(k) + 0.5 + TIME_ZONE / 24);
}

function sunLongitudeSector(dayNumber: number) {
  return Math.floor(
    (sunLongitude(dayNumber - 0.5 - TIME_ZONE / 24) / Math.PI) * 6,
  );
}

function lunarMonth11(year: number) {
  const offset = julianDayNumber(31, 12, year) - 2415021;
  const k = Math.floor(offset / SYNODIC_MONTH);
  let moon = newMoonDay(k);
  if (sunLongitudeSector(moon) >= 9) moon = newMoonDay(k - 1);
  return moon;
}

function leapMonthOffset(month11: number) {
  const k = Math.floor((month11 - NEW_MOON_EPOCH) / SYNODIC_MONTH + 0.5);
  let last = 0;
  let index = 1;
  let arc = sunLongitudeSector(newMoonDay(k + index));
  do {
    last = arc;
    index += 1;
    arc = sunLongitudeSector(newMoonDay(k + index));
  } while (arc !== last && index < 14);
  return index - 1;
}

export function solarToLunar(date: CalendarDate): LunarDate {
  assertSolarDate(date);
  const dayNumber = julianDayNumber(date.day, date.month, date.year);
  const k = Math.floor((dayNumber - NEW_MOON_EPOCH) / SYNODIC_MONTH);
  let monthStart = newMoonDay(k + 1);
  if (monthStart > dayNumber) monthStart = newMoonDay(k);

  let month11A = lunarMonth11(date.year);
  let month11B = month11A;
  let lunarYear: number;
  if (month11A >= monthStart) {
    lunarYear = date.year;
    month11A = lunarMonth11(date.year - 1);
  } else {
    lunarYear = date.year + 1;
    month11B = lunarMonth11(date.year + 1);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const difference = Math.floor((monthStart - month11A) / 29);
  let lunarMonth = difference + 11;
  let leap = false;
  if (month11B - month11A > 365) {
    const leapOffset = leapMonthOffset(month11A);
    if (difference >= leapOffset) {
      lunarMonth = difference + 10;
      if (difference === leapOffset) leap = true;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && difference < 4) lunarYear -= 1;
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap };
}

export function lunarToSolar(date: LunarDate): CalendarDate {
  assertYear(date.year);
  if (
    !Number.isInteger(date.day) ||
    !Number.isInteger(date.month) ||
    date.day < 1 ||
    date.day > 30 ||
    date.month < 1 ||
    date.month > 12
  ) {
    throw new Error("Enter a valid lunar date.");
  }

  let month11A: number;
  let month11B: number;
  if (date.month < 11) {
    month11A = lunarMonth11(date.year - 1);
    month11B = lunarMonth11(date.year);
  } else {
    month11A = lunarMonth11(date.year);
    month11B = lunarMonth11(date.year + 1);
  }
  const k = Math.floor(
    0.5 + (month11A - NEW_MOON_EPOCH) / SYNODIC_MONTH,
  );
  let offset = date.month - 11;
  if (offset < 0) offset += 12;

  if (month11B - month11A > 365) {
    const leapOffset = leapMonthOffset(month11A);
    let leapMonth = leapOffset - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (date.leap && date.month !== leapMonth) {
      throw new Error("That year does not have the selected leap month.");
    }
    if (date.leap || offset >= leapOffset) offset += 1;
  } else if (date.leap) {
    throw new Error("That lunar year does not contain a leap month.");
  }

  const result = dateFromJulianDay(newMoonDay(k + offset) + date.day - 1);
  const roundTrip = solarToLunar(result);
  if (
    roundTrip.day !== date.day ||
    roundTrip.month !== date.month ||
    roundTrip.year !== date.year ||
    roundTrip.leap !== date.leap
  ) {
    throw new Error("Enter a valid lunar date and leap-month selection.");
  }
  return result;
}

export function getCanChiYear(year: number) {
  const stems = [
    "Canh",
    "Tân",
    "Nhâm",
    "Quý",
    "Giáp",
    "Ất",
    "Bính",
    "Đinh",
    "Mậu",
    "Kỷ",
  ];
  const branches = [
    "Thân",
    "Dậu",
    "Tuất",
    "Hợi",
    "Tý",
    "Sửu",
    "Dần",
    "Mão",
    "Thìn",
    "Tỵ",
    "Ngọ",
    "Mùi",
  ];
  return `${stems[((year % 10) + 10) % 10]} ${branches[((year % 12) + 12) % 12]}`;
}

