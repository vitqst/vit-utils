import {
  format,
  type KeywordCase,
  type SqlLanguage,
} from "sql-formatter";

export const SQL_DIALECTS = [
  { id: "sql", en: "Standard SQL", vi: "SQL chuẩn" },
  { id: "bigquery", en: "BigQuery", vi: "BigQuery" },
  { id: "mysql", en: "MySQL", vi: "MySQL" },
  { id: "mariadb", en: "MariaDB", vi: "MariaDB" },
  { id: "postgresql", en: "PostgreSQL", vi: "PostgreSQL" },
  { id: "sqlite", en: "SQLite", vi: "SQLite" },
  { id: "transactsql", en: "Transact-SQL", vi: "Transact-SQL" },
  { id: "plsql", en: "PL/SQL", vi: "PL/SQL" },
  { id: "snowflake", en: "Snowflake", vi: "Snowflake" },
  { id: "spark", en: "Spark", vi: "Spark" },
] as const satisfies ReadonlyArray<{
  id: SqlLanguage;
  en: string;
  vi: string;
}>;

export type SqlDialect = (typeof SQL_DIALECTS)[number]["id"];
export type SqlKeywordCase = KeywordCase;

interface SqlFormatOptions {
  dialect: SqlDialect;
  indent: 2 | 4;
  keywordCase: SqlKeywordCase;
}

export type SqlFormatResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function formatSql(
  source: string,
  options: SqlFormatOptions,
): SqlFormatResult {
  if (!source.trim()) return { ok: true, value: "" };

  try {
    return {
      ok: true,
      value: format(source, {
        language: options.dialect,
        tabWidth: options.indent,
        keywordCase: options.keywordCase,
        useTabs: false,
      }),
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to format SQL.",
    };
  }
}

