# Timezone Converter

## Purpose

Interpret one wall-clock date and time in an IANA source zone and compare the
same instant across other IANA zones.

## Behavior

- Use browser `Intl` time-zone data, including historical/current daylight-saving
  offsets.
- Accept a local date-time plus one source zone and one or more target zones.
- Show ISO instant, localized target date/time, zone name, and UTC offset.
- Reject invalid IANA zones and wall times that do not exist during a DST jump.
- When a wall time occurs twice during a DST fallback, choose the earlier instant
  and explicitly mark the input as ambiguous.
- Offer common zones even if the browser cannot enumerate every supported zone.

All work is local. Results depend on the browser's installed IANA time-zone data.

## Accessibility and localization

- Date-time and zone controls, warnings, results, and errors are semantic.
- English and Vietnamese copy ship together.

