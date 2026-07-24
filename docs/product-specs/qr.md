# QR Code

## Purpose

Generate downloadable QR codes locally from plain text, web links, Wi-Fi
credentials, or contact details.

## Behavior

- Plain text accepts non-empty Unicode text.
- URL mode requires an absolute HTTP or HTTPS URL.
- Wi-Fi mode builds the standard `WIFI:` payload with None/WEP/WPA security,
  hidden-network support, and escaped delimiter characters.
- Contact mode emits a vCard 3.0 payload from name plus optional phone, email,
  and organization.
- Offer error-correction levels L/M/Q/H, 128–2,048 px width, 0–20 module margin,
  and valid dark/light hex colors.
- Preview and download PNG or SVG. Revoke generated object URLs on replacement
  and unmount.
- Reject empty/oversized payloads and generator errors accessibly.

All payload construction and image generation occur locally.

## Accessibility and localization

- Payload type, fields, rendering options, preview alternative text, errors, and
  downloads are semantic.
- English and Vietnamese copy ship together.

