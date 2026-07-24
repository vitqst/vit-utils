# SHA / MD5 hashes

## Purpose

Hash UTF-8 text locally and identify likely algorithms from hexadecimal digest
lengths.

## Behavior

- SHA-256, SHA-384, SHA-512, SHA-1, and MD5 output in lowercase hexadecimal.
- Text is encoded as UTF-8 exactly as entered; no trimming or normalization.
- Input is limited to 1,000,000 UTF-16 code units.
- Digest identification recognizes 32, 40, 64, 96, and 128 hexadecimal
  characters. A match indicates only a possible format, not authenticity.
- SHA-1 and MD5 are visibly labeled legacy and unsuitable for new security
  designs.

The output can be copied or downloaded. Empty input is a valid hash input.

## Privacy and accessibility

Text and digests remain in component memory and are never sent or persisted.
English and Vietnamese semantic controls expose input, algorithm, output,
identification, copy, download, and reset.

