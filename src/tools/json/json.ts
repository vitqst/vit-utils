export type JsonMode = "format" | "minify";

export interface JsonTransformOptions {
  mode: JsonMode;
  indent?: 2 | 4;
  sortKeys?: boolean;
}

export interface JsonTransformError {
  message: string;
  line?: number;
  column?: number;
  position?: number;
}

export interface JsonTransformResult {
  output: string;
  error: JsonTransformError | null;
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJsonValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortJsonValue(child)]),
    );
  }
  return value;
}

function lineAndColumn(source: string, position: number) {
  const before = source.slice(0, position);
  const lines = before.split("\n");
  return {
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  };
}

function parseError(error: unknown, source: string): JsonTransformError {
  const message = error instanceof Error ? error.message : String(error);
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const position = Number(positionMatch[1]);
    return { message, position, ...lineAndColumn(source, position) };
  }
  const locationMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (locationMatch) {
    return {
      message,
      line: Number(locationMatch[1]),
      column: Number(locationMatch[2]),
    };
  }
  return { message };
}

export function transformJson(
  source: string,
  {
    mode,
    indent = 2,
    sortKeys = false,
  }: JsonTransformOptions,
): JsonTransformResult {
  if (!source.trim()) return { output: "", error: null };

  try {
    const parsed: unknown = JSON.parse(source);
    const value = sortKeys ? sortJsonValue(parsed) : parsed;
    return {
      output: JSON.stringify(value, null, mode === "format" ? indent : 0),
      error: null,
    };
  } catch (error) {
    return { output: "", error: parseError(error, source) };
  }
}

