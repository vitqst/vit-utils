# Photo Collage Editor Design

## Product direction

Upgrade Photo Collage from a form followed by a rendered result into a live,
private editor. The useful Pixlr-style workflow is reproduced without its
branding, cloud features, AI claims, accounts, carousel mode, text, or stickers.
Users add local photos, choose a suggested layout, adjust the whole composition
and an individual photo, then export PNG or JPEG.

The reference direction uses three clear regions on wide screens: photos and
layout templates on the left, a dominant live canvas in the center, and
composition settings on the right. On smaller screens the same regions stack in
the order photos, canvas, settings. Charcoal and the existing application
tokens provide the base; green is reserved for the local-only indicator, focus,
and selected controls.

## Interaction model

- Adding images creates ephemeral object URLs for thumbnails and the live
  preview. Removing, resetting, or unmounting revokes them.
- Layout suggestions are deterministic templates selected by photo count.
  Selecting a template updates the preview immediately.
- Photo tiles can be swapped with pointer drag-and-drop. Move-earlier and
  move-later buttons remain available for keyboard and assistive technology.
- The composition supports original, 1:1, 4:5, 16:9, and 9:16 aspect ratios;
  spacing; background color; corner radius; fill or fit; output width; and
  PNG/JPEG export.
- Selecting a cell exposes zoom and horizontal/vertical crop-position controls.
  These adjustments alter both live preview and exported output.
- Preview updates are CSS-driven from local object URLs. Export alone performs
  CPU-heavy bitmap decode and canvas drawing in the existing cancellable worker.

## Privacy and data flow

Files never leave the browser and are not persisted. No fetch, XMLHttpRequest,
WebSocket, remote URL, analytics, or storage API is added. File bytes move from
the file input to the worker only during export. The worker returns a Blob;
the component creates one temporary download URL and revokes replaced URLs.

## Rendering model

Templates are normalized rectangles with values from zero to one. Geometry
scales them into output pixels while applying the selected aspect ratio and
spacing. Preview cells use the same normalized template and crop state through
CSS grid-independent absolute positioning. The worker clips each cell to its
rounded rectangle, fills the background, and draws each bitmap using per-image
fit, zoom, and focal position.

## Accessibility and failures

All settings have visible labels and numeric values. Layout choices are radio
controls with a visible selected state. Each photo has semantic reorder, select,
and remove buttons; drag-and-drop is an enhancement. Selected-photo controls
identify the filename. Status and errors remain live regions. Invalid counts,
files, dimensions, output area, and unavailable canvas features remain explicit
and localized.

## Testing

Geometry tests cover template selection, aspect dimensions, spacing, normalized
cell conversion, and crop math. Renderer tests prove rounded clipping and
per-photo crop settings reach canvas operations. Component tests cover the live
preview, layout and aspect selection, photo selection/crop controls, accessible
reordering, worker payloads, URL cleanup, Vietnamese copy, and the absence of
network/persistence calls. Full test, typecheck, build, and source audits finish
the change.
