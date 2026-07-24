export type CurlTarget =
  | "browser-fetch"
  | "node-fetch"
  | "python"
  | "php";

export interface CurlRequest {
  url: string;
  method: string;
  headers: Array<[string, string]>;
  body?: string;
}

const MAX_SOURCE_LENGTH = 100_000;

export function tokenizeCurl(source: string): string[] {
  if (source.length > MAX_SOURCE_LENGTH) {
    throw new Error("The curl command is too large.");
  }
  if (source.includes("$(") || source.includes("`")) {
    throw new Error("Command substitution is not supported.");
  }

  const tokens: string[] = [];
  let token = "";
  let started = false;
  let quote: "'" | '"' | null = null;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (quote === "'") {
      if (character === "'") quote = null;
      else token += character;
      continue;
    }

    if (quote === '"') {
      if (character === '"') {
        quote = null;
      } else if (character === "\\") {
        const next = source[index + 1];
        if (next === "\n") index += 1;
        else if (next !== undefined) {
          token += next;
          index += 1;
        } else {
          throw new Error("The command ends with an incomplete escape.");
        }
      } else if (character === "$") {
        throw new Error("Shell expansion is not supported.");
      } else {
        token += character;
      }
      continue;
    }

    if (character === "'" || character === '"') {
      quote = character;
      started = true;
    } else if (character === "\\") {
      const next = source[index + 1];
      if (next === "\n") index += 1;
      else if (next !== undefined) {
        token += next;
        started = true;
        index += 1;
      } else {
        throw new Error("The command ends with an incomplete escape.");
      }
    } else if (/\s/.test(character)) {
      if (started) {
        tokens.push(token);
        token = "";
        started = false;
      }
    } else if ("|;&<>".includes(character) || character === "$") {
      throw new Error(`Shell operator "${character}" is not supported.`);
    } else {
      token += character;
      started = true;
    }
  }

  if (quote) throw new Error("The command contains an unterminated quote.");
  if (started) tokens.push(token);
  return tokens;
}

function encodeBasicAuth(value: string) {
  const bytes = new TextEncoder().encode(value);
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    const combined = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);
    output += alphabet[(combined >> 18) & 63];
    output += alphabet[(combined >> 12) & 63];
    output += second === undefined ? "=" : alphabet[(combined >> 6) & 63];
    output += third === undefined ? "=" : alphabet[combined & 63];
  }

  return output;
}

function addHeader(
  headers: Array<[string, string]>,
  header: string,
): void {
  if (/[\r\n]/.test(header)) throw new Error("Header line breaks are invalid.");
  const separator = header.indexOf(":");
  if (separator <= 0) throw new Error(`Invalid header: ${header}`);
  const name = header.slice(0, separator).trim();
  const value = header.slice(separator + 1).trim();
  if (!name) throw new Error(`Invalid header: ${header}`);
  headers.push([name, value]);
}

function hasHeader(headers: Array<[string, string]>, name: string) {
  const normalized = name.toLowerCase();
  return headers.some(([header]) => header.toLowerCase() === normalized);
}

export function parseCurlCommand(source: string): CurlRequest {
  const tokens = tokenizeCurl(source);
  if (tokens[0] !== "curl") {
    throw new Error('The command must begin with "curl".');
  }

  let url = "";
  let explicitMethod = "";
  let useGet = false;
  const headers: Array<[string, string]> = [];
  const data: string[] = [];

  const takeValue = (index: number, flag: string) => {
    const value = tokens[index + 1];
    if (value === undefined || value.startsWith("-")) {
      throw new Error(`${flag} requires a value.`);
    }
    return value;
  };

  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index];
    const equals = token.match(/^(--(?:request|header|data|data-raw|json|user))=(.*)$/s);
    const flag = equals?.[1] ?? token;
    let inlineValue = equals?.[2];

    if (flag === "-X" || flag === "--request") {
      inlineValue ??= takeValue(index, flag);
      if (!equals) index += 1;
      if (!/^[A-Za-z]+$/.test(inlineValue)) {
        throw new Error("The HTTP method is invalid.");
      }
      explicitMethod = inlineValue.toUpperCase();
    } else if (flag === "-H" || flag === "--header") {
      inlineValue ??= takeValue(index, flag);
      if (!equals) index += 1;
      addHeader(headers, inlineValue);
    } else if (
      flag === "-d" ||
      flag === "--data" ||
      flag === "--data-raw" ||
      flag === "--json"
    ) {
      inlineValue ??= takeValue(index, flag);
      if (!equals) index += 1;
      if (inlineValue.startsWith("@")) {
        throw new Error("Reading request data from a file is not supported.");
      }
      data.push(inlineValue);
      if (flag === "--json") {
        if (!hasHeader(headers, "Content-Type")) {
          headers.push(["Content-Type", "application/json"]);
        }
        if (!hasHeader(headers, "Accept")) {
          headers.push(["Accept", "application/json"]);
        }
      }
    } else if (flag === "-u" || flag === "--user") {
      inlineValue ??= takeValue(index, flag);
      if (!equals) index += 1;
      headers.push(["Authorization", `Basic ${encodeBasicAuth(inlineValue)}`]);
    } else if (flag === "-G" || flag === "--get") {
      useGet = true;
    } else if (flag.startsWith("-")) {
      throw new Error(`Unsupported curl option: ${flag}`);
    } else if (url) {
      throw new Error(`Unexpected extra argument: ${token}`);
    } else {
      url = token;
    }
  }

  if (!url) throw new Error("A request URL is required.");
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("The request URL is invalid.");
  }
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  const combinedData = data.join("&");
  if (useGet && combinedData) {
    const query = new URLSearchParams(combinedData);
    query.forEach((value, key) => parsedUrl.searchParams.append(key, value));
  }

  const method = explicitMethod || (useGet ? "GET" : data.length ? "POST" : "GET");
  return {
    url: parsedUrl.toString(),
    method,
    headers,
    ...(useGet || !data.length ? {} : { body: combinedData }),
  };
}

function jsString(value: string) {
  return JSON.stringify(value);
}

function pythonString(value: string) {
  return JSON.stringify(value).replace(/\u2028|\u2029/g, "");
}

function phpString(value: string) {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function generateFetch(request: CurlRequest, includeImport: boolean) {
  const options = [
    `  method: ${jsString(request.method)},`,
    ...(request.headers.length
      ? [
          "  headers: [",
          ...request.headers.map(
            ([name, value]) => `    [${jsString(name)}, ${jsString(value)}],`,
          ),
          "  ],",
        ]
      : []),
    ...(request.body === undefined
      ? []
      : [`  body: ${jsString(request.body)},`]),
  ];
  return [
    ...(includeImport ? ['import fetch from "node-fetch";', ""] : []),
    `const response = await fetch(${jsString(request.url)}, {`,
    ...options,
    "});",
    "",
    "if (!response.ok) {",
    '  throw new Error(`HTTP ${response.status}`);',
    "}",
    "",
    "const data = await response.text();",
  ].join("\n");
}

function generatePython(request: CurlRequest) {
  const headerLines = request.headers.map(
    ([name, value]) => `    ${pythonString(name)}: ${pythonString(value)},`,
  );
  return [
    "import requests",
    "",
    `response = requests.request(`,
    `    ${pythonString(request.method)},`,
    `    ${pythonString(request.url)},`,
    ...(headerLines.length
      ? ["    headers={", ...headerLines, "    },"]
      : []),
    ...(request.body === undefined
      ? []
      : [`    data=${pythonString(request.body)},`]),
    ")",
    "response.raise_for_status()",
    "data = response.text",
  ].join("\n");
}

function generatePhp(request: CurlRequest) {
  const headerValues = request.headers.map(([name, value]) =>
    phpString(`${name}: ${value}`),
  );
  return [
    "<?php",
    `$curl = curl_init(${phpString(request.url)});`,
    "curl_setopt_array($curl, [",
    "    CURLOPT_RETURNTRANSFER => true,",
    `    CURLOPT_CUSTOMREQUEST => ${phpString(request.method)},`,
    ...(headerValues.length
      ? [`    CURLOPT_HTTPHEADER => [${headerValues.join(", ")}],`]
      : []),
    ...(request.body === undefined
      ? []
      : [`    CURLOPT_POSTFIELDS => ${phpString(request.body)},`]),
    "]);",
    "$response = curl_exec($curl);",
    "curl_close($curl);",
  ].join("\n");
}

export function generateCurlCode(
  request: CurlRequest,
  target: CurlTarget,
): string {
  switch (target) {
    case "browser-fetch":
      return generateFetch(request, false);
    case "node-fetch":
      return generateFetch(request, true);
    case "python":
      return generatePython(request);
    case "php":
      return generatePhp(request);
  }
}

export function convertCurl(source: string, target: CurlTarget) {
  return generateCurlCode(parseCurlCommand(source), target);
}

