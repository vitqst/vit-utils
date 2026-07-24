export type DiffLineType = "equal" | "insert" | "delete";

export interface DiffLine {
  type: DiffLineType;
  value: string;
  oldLine?: number;
  newLine?: number;
}

interface Edit {
  type: DiffLineType;
  value: string;
}

function lines(value: string): string[] {
  if (!value) return [];
  return value.replace(/\r\n?/g, "\n").split("\n");
}

function coordinate(map: Map<number, number>, diagonal: number): number {
  return map.get(diagonal) ?? Number.NEGATIVE_INFINITY;
}

function backtrack(
  trace: Map<number, number>[],
  before: string[],
  after: string[],
): Edit[] {
  let x = before.length;
  let y = after.length;
  const edits: Edit[] = [];

  for (let depth = trace.length - 1; depth >= 0; depth -= 1) {
    const vector = trace[depth];
    const diagonal = x - y;
    const previousDiagonal =
      diagonal === -depth ||
      (diagonal !== depth &&
        coordinate(vector, diagonal - 1) < coordinate(vector, diagonal + 1))
        ? diagonal + 1
        : diagonal - 1;
    const previousX = vector.get(previousDiagonal) ?? 0;
    const previousY = previousX - previousDiagonal;

    while (x > previousX && y > previousY) {
      edits.push({ type: "equal", value: before[x - 1] });
      x -= 1;
      y -= 1;
    }

    if (depth === 0) break;
    if (x === previousX) {
      edits.push({ type: "insert", value: after[y - 1] });
      y -= 1;
    } else {
      edits.push({ type: "delete", value: before[x - 1] });
      x -= 1;
    }
  }

  return edits.reverse();
}

function editsFor(before: string[], after: string[]): Edit[] {
  const maximumDepth = before.length + after.length;
  const vector = new Map<number, number>([[1, 0]]);
  const trace: Map<number, number>[] = [];

  for (let depth = 0; depth <= maximumDepth; depth += 1) {
    trace.push(new Map(vector));
    for (
      let diagonal = -depth;
      diagonal <= depth;
      diagonal += 2
    ) {
      let x =
        diagonal === -depth ||
        (diagonal !== depth &&
          coordinate(vector, diagonal - 1) <
            coordinate(vector, diagonal + 1))
          ? coordinate(vector, diagonal + 1)
          : coordinate(vector, diagonal - 1) + 1;
      if (!Number.isFinite(x)) x = 0;
      let y = x - diagonal;

      while (
        x < before.length &&
        y < after.length &&
        before[x] === after[y]
      ) {
        x += 1;
        y += 1;
      }
      vector.set(diagonal, x);

      if (x >= before.length && y >= after.length) {
        return backtrack(trace, before, after);
      }
    }
  }

  return [];
}

export function diffLines(beforeText: string, afterText: string): DiffLine[] {
  const before = lines(beforeText);
  const after = lines(afterText);
  let oldLine = 1;
  let newLine = 1;

  return editsFor(before, after).map((edit) => {
    if (edit.type === "equal") {
      const line = { ...edit, oldLine, newLine };
      oldLine += 1;
      newLine += 1;
      return line;
    }
    if (edit.type === "delete") {
      const line = { ...edit, oldLine };
      oldLine += 1;
      return line;
    }
    const line = { ...edit, newLine };
    newLine += 1;
    return line;
  });
}

