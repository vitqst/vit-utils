# Photo Cure

## Job

Help a photographer make fast keep/reject decisions across a large local shoot, compare burst frames, undo mistakes, and review the final selection.

## Privacy

- Inputs come from the file or directory picker.
- Photos are represented by `File` objects and temporary object URLs.
- Object URLs are created only for visible/preloaded images and revoked after use.
- No photo, filename, selection, or derived preview leaves the browser.

## Core flows

1. Choose a directory or image files.
2. Judge frames with buttons or keyboard shortcuts.
3. Compare burst frames where applicable.
4. Undo a decision.
5. Review kept/rejected images and reclassify.

## Quality requirements

- Handle at least 5,000 file records without creating 5,000 blob URLs.
- Virtualize large review grids and burst strips.
- Limit concurrent large-image preview decodes.
- Keep the active image and next preload stable during navigation.
- Preserve keyboard use and clear keep/reject color semantics.

## Out of scope

- Cloud sync
- Remote backups
- Server-side image analysis
- Editing original files
