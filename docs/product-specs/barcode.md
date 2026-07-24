# Barcode

## Purpose

Generate validated one-dimensional barcodes locally as scalable SVG.

## Behavior

- Support Code 128, EAN-13, UPC-A, Code 39, and ITF-14.
- Validate format-specific character sets, lengths, and supplied GS1 check
  digits. Accept the digit before a check digit and let the renderer calculate
  it.
- Configure bar width, height, margin, foreground/background colors, and
  human-readable text.
- Render a preview and downloadable SVG without injecting source markup into the
  page.
- Surface both pre-validation and renderer errors.

All generation occurs locally. A visually valid barcode does not confirm that a
number has been issued by GS1 or another authority.

## Accessibility and localization

- Format/data/options, preview label, validation errors, and download controls
  are semantic.
- English and Vietnamese copy ship together.

