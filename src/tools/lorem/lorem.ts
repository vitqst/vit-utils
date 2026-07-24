export type LoremUnit = "words" | "sentences" | "paragraphs";

export interface LoremOptions {
  unit: LoremUnit;
  count: number;
  startWithLorem?: boolean;
}

const corpus = [
  "lorem",
  "ipsum",
  "dolor",
  "sit",
  "amet",
  "consectetur",
  "adipiscing",
  "elit",
  "sed",
  "do",
  "eiusmod",
  "tempor",
  "incididunt",
  "ut",
  "labore",
  "et",
  "dolore",
  "magna",
  "aliqua",
  "enim",
  "ad",
  "minim",
  "veniam",
  "quis",
  "nostrud",
  "exercitation",
  "ullamco",
  "laboris",
  "nisi",
  "aliquip",
  "ex",
  "ea",
  "commodo",
  "consequat",
  "duis",
  "aute",
  "irure",
  "reprehenderit",
  "voluptate",
  "velit",
  "esse",
  "cillum",
  "fugiat",
  "nulla",
  "pariatur",
  "excepteur",
  "sint",
  "occaecat",
  "cupidatat",
  "proident",
];

const limits: Record<LoremUnit, number> = {
  words: 1000,
  sentences: 100,
  paragraphs: 20,
};

const sentenceLengths = [8, 11, 9, 12, 10];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function takeWords(start: number, count: number): string[] {
  return Array.from(
    { length: count },
    (_, index) => corpus[(start + index) % corpus.length],
  );
}

function sentenceAt(start: number, sentenceIndex: number) {
  const length = sentenceLengths[sentenceIndex % sentenceLengths.length];
  const words = takeWords(start, length);
  return {
    value: `${capitalize(words.join(" "))}.`,
    next: start + length,
  };
}

export function generateLorem({
  unit,
  count,
  startWithLorem = true,
}: LoremOptions): string {
  const normalizedCount = Math.min(
    limits[unit],
    Math.max(0, Math.floor(Number.isFinite(count) ? count : 0)),
  );
  if (!normalizedCount) return "";

  let cursor = startWithLorem ? 0 : 10;
  if (unit === "words") {
    const result = takeWords(cursor, normalizedCount).join(" ");
    return startWithLorem ? capitalize(result) : result;
  }

  const paragraphCount = unit === "paragraphs" ? normalizedCount : 1;
  const sentenceCount =
    unit === "sentences" ? normalizedCount : paragraphCount * 3;
  const sentences: string[] = [];

  for (let index = 0; index < sentenceCount; index += 1) {
    const sentence = sentenceAt(cursor, index);
    sentences.push(sentence.value);
    cursor = sentence.next;
  }

  if (unit === "sentences") return sentences.join(" ");
  return Array.from({ length: paragraphCount }, (_, paragraphIndex) =>
    sentences
      .slice(paragraphIndex * 3, paragraphIndex * 3 + 3)
      .join(" "),
  ).join("\n\n");
}

