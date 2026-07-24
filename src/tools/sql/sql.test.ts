import { describe, expect, it } from "vitest";

import { formatSql, SQL_DIALECTS } from "./sql";

describe("formatSql", () => {
  it("formats PostgreSQL with uppercase keywords and selected indentation", () => {
    const result = formatSql("select * from users where id = 1", {
      dialect: "postgresql",
      indent: 2,
      keywordCase: "upper",
    });

    expect(result).toEqual({
      ok: true,
      value: "SELECT\n  *\nFROM\n  users\nWHERE\n  id = 1",
    });
  });

  it("supports the ten advertised dialects", () => {
    expect(SQL_DIALECTS.map(({ id }) => id)).toEqual([
      "sql",
      "bigquery",
      "mysql",
      "mariadb",
      "postgresql",
      "sqlite",
      "transactsql",
      "plsql",
      "snowflake",
      "spark",
    ]);
  });

  it("preserves the source and returns an empty result for blank input", () => {
    const source = "  ";
    expect(
      formatSql(source, {
        dialect: "sql",
        indent: 4,
        keywordCase: "preserve",
      }),
    ).toEqual({ ok: true, value: "" });
    expect(source).toBe("  ");
  });

  it("returns formatter errors instead of throwing", () => {
    const result = formatSql("SELECT 'unterminated", {
      dialect: "mysql",
      indent: 2,
      keywordCase: "lower",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/parse error/i);
  });
});
