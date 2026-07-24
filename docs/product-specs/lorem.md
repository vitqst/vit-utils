# Lorem Ipsum Generator

## Job

Generate predictable placeholder words, sentences, or paragraphs locally for
layouts, prototypes, and tests.

## Core flows

1. Choose words, sentences, or paragraphs.
2. Enter an amount within the visible limit.
3. Choose whether the output starts with “Lorem ipsum”.
4. Review and copy the generated text.

## Behavior

- Use a fixed local Latin word corpus; the same options always produce the same
  output.
- Word mode supports 1–1,000 words, sentence mode 1–100 sentences, and paragraph
  mode 1–20 paragraphs.
- Paragraphs contain three deterministic sentences and are separated by a blank
  line.
- Sentence output is capitalized and punctuated.
- A non-positive amount produces empty output; amounts above the limit are clamped
  to protect the interface.
- “Start with Lorem ipsum” controls the initial corpus position without changing
  the requested unit count.

## Privacy

No input or generated text leaves component memory.

## Out of scope

- Randomized seeded corpora
- Non-Latin placeholder languages
- AI-generated prose

