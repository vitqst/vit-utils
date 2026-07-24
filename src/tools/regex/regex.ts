export interface RegexMatch {
  value: string;
  index: number;
  end: number;
  groups: (string | undefined)[];
  namedGroups: Record<string, string | undefined>;
}

export interface RegexResult {
  matches: RegexMatch[];
  error: string | null;
}

function advanceAfterEmptyMatch(
  expression: RegExp,
  input: string,
  index: number,
) {
  if (!expression.unicode) {
    expression.lastIndex = index + 1;
    return;
  }
  const codePoint = input.codePointAt(index);
  expression.lastIndex =
    index + (codePoint !== undefined && codePoint > 0xffff ? 2 : 1);
}

function resultFor(match: RegExpExecArray): RegexMatch {
  return {
    value: match[0],
    index: match.index,
    end: match.index + match[0].length,
    groups: match.slice(1),
    namedGroups: match.groups ? { ...match.groups } : {},
  };
}

export function testRegex(
  pattern: string,
  input: string,
  flags = "g",
): RegexResult {
  try {
    const expression = new RegExp(pattern, flags);
    const matches: RegexMatch[] = [];

    if (!expression.global) {
      const match = expression.exec(input);
      return {
        matches: match ? [resultFor(match)] : [],
        error: null,
      };
    }

    let match: RegExpExecArray | null;
    while ((match = expression.exec(input)) !== null) {
      matches.push(resultFor(match));
      if (match[0] === "") {
        advanceAfterEmptyMatch(expression, input, match.index);
      }
    }

    return { matches, error: null };
  } catch (error) {
    return {
      matches: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
