import type { RandomBytes } from "../ids/ids";

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export interface PassphraseOptions {
  words: number;
  separator: string;
  capitalize: boolean;
  includeNumber: boolean;
}

const secureRandomBytes: RandomBytes = (length) =>
  crypto.getRandomValues(new Uint8Array(length));

const WORDS = [
  "amber", "apple", "atlas", "bamboo", "beacon", "berry", "birch", "breeze",
  "brook", "cedar", "cherry", "cloud", "clover", "comet", "coral", "crane",
  "dawn", "delta", "dune", "ember", "falcon", "fern", "field", "fjord",
  "flame", "forest", "fox", "frost", "garden", "glade", "harbor", "hazel",
  "heron", "honey", "island", "jade", "lake", "lark", "leaf", "lemon",
  "lotus", "maple", "meadow", "melon", "mist", "moon", "moss", "ocean",
  "olive", "orchid", "otter", "pearl", "pine", "plum", "pond", "quartz",
  "rain", "raven", "reef", "river", "rose", "sage", "shell", "shore",
  "sky", "snow", "solar", "sparrow", "spruce", "star", "stone", "storm",
  "sun", "swift", "tide", "tiger", "trail", "tulip", "valley", "violet",
  "wave", "willow", "wind", "wolf", "wood", "wren", "zephyr", "zinnia",
] as const;

function randomIndex(max: number, randomBytes: RandomBytes) {
  if (max < 1 || max > 256) throw new Error("Random pool size is invalid.");
  const limit = Math.floor(256 / max) * max;
  for (;;) {
    const bytes = randomBytes(1);
    if (!bytes.length) throw new Error("Random source returned too few bytes.");
    if (bytes[0] < limit) return bytes[0] % max;
  }
}

function choose(pool: string, randomBytes: RandomBytes) {
  return pool[randomIndex(pool.length, randomBytes)];
}

function shuffle(values: string[], randomBytes: RandomBytes) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1, randomBytes);
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values;
}

function poolsFor(options: PasswordOptions) {
  const ambiguous = /[O0Il1|]/g;
  return [
    options.uppercase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "",
    options.lowercase ? "abcdefghijklmnopqrstuvwxyz" : "",
    options.digits ? "0123456789" : "",
    options.symbols ? "!@#$%^&*()-_=+[]{}:,.?|" : "",
  ]
    .filter(Boolean)
    .map((pool) => (options.excludeAmbiguous ? pool.replace(ambiguous, "") : pool));
}

export function generatePassword(
  options: PasswordOptions,
  randomBytes: RandomBytes = secureRandomBytes,
) {
  if (!Number.isInteger(options.length) || options.length < 4 || options.length > 256) {
    throw new Error("Password length must be an integer from 4 through 256.");
  }
  const pools = poolsFor(options);
  if (!pools.length) throw new Error("Select at least one character class.");
  if (options.length < pools.length) {
    throw new Error("Password length is too short for every selected class.");
  }
  const all = pools.join("");
  const characters = pools.map((pool) => choose(pool, randomBytes));
  while (characters.length < options.length) {
    characters.push(choose(all, randomBytes));
  }
  return shuffle(characters, randomBytes).join("");
}

export function generatePassphrase(
  options: PassphraseOptions,
  randomBytes: RandomBytes = secureRandomBytes,
) {
  if (!Number.isInteger(options.words) || options.words < 3 || options.words > 20) {
    throw new Error("Passphrase word count must be an integer from 3 through 20.");
  }
  if (options.separator.length > 3 || /[\r\n]/.test(options.separator)) {
    throw new Error("Separator must contain at most three non-line-break characters.");
  }
  const words = Array.from({ length: options.words }, () => {
    const word = WORDS[randomIndex(WORDS.length, randomBytes)];
    return options.capitalize
      ? word.charAt(0).toUpperCase() + word.slice(1)
      : word;
  });
  if (options.includeNumber) {
    words.push(String(randomIndex(100, randomBytes)));
  }
  return words.join(options.separator);
}

export function estimatePasswordEntropy(length: number, poolSize: number) {
  if (length < 0 || poolSize < 1) return 0;
  return length * Math.log2(poolSize);
}

export function passwordPoolSize(options: PasswordOptions) {
  return poolsFor(options).reduce((total, pool) => total + pool.length, 0);
}

export function passphraseEntropy(options: PassphraseOptions) {
  return (
    options.words * Math.log2(WORDS.length) +
    (options.includeNumber ? Math.log2(100) : 0)
  );
}

