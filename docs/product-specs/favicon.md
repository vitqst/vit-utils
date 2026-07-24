# Favicon set

## Purpose

Create a complete favicon package from one local image without uploading it.

## Inputs

- One PNG, JPEG, or WebP image, up to 20 MB.
- An application name.
- A six-digit hexadecimal theme color.

## Outputs

- Transparent PNG icons at 16, 32, 48, 180, 192, and 512 pixels.
- `site.webmanifest`, `browserconfig.xml`, and `favicon-links.html`.
- One downloadable `favicon-set.zip`.

The source image is aspect-fitted and centered on each square canvas. Processing
and ZIP creation happen in a cancellable Web Worker. Replacing a result, reset,
and unmount revoke any object URL previously created by the tool.

## Privacy and accessibility

Image bytes stay in the browser and are transferred only to the local worker.
The tool does not use network or persistent-storage APIs. File selection,
generation, cancellation, reset, progress, errors, and download are exposed with
semantic controls and live status text in English and Vietnamese.

