export type IdentifierType = "uuid" | "ulid" | "nanoid";
export type RandomBytes = (length: number) => Uint8Array;

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const NANO_ALPHABET =
  "_-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const secureRandomBytes: RandomBytes = (length) =>
  crypto.getRandomValues(new Uint8Array(length));

export function generateUuid(randomBytes: RandomBytes = secureRandomBytes) {
  const bytes = randomBytes(16).slice();
  if (bytes.length !== 16) throw new Error("Random source returned too few bytes.");
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10).join(""),
  ].join("-");
}

function encodeTime(time: number) {
  if (!Number.isInteger(time) || time < 0 || time > 281_474_976_710_655) {
    throw new Error("ULID timestamp is outside its 48-bit range.");
  }
  let value = time;
  let output = "";
  for (let index = 0; index < 10; index += 1) {
    output = CROCKFORD[value % 32] + output;
    value = Math.floor(value / 32);
  }
  return output;
}

function encodeRandom(bytes: Uint8Array) {
  let value = 0n;
  for (const byte of bytes) value = (value << 8n) | BigInt(byte);
  let output = "";
  for (let index = 0; index < 16; index += 1) {
    output = CROCKFORD[Number(value & 31n)] + output;
    value >>= 5n;
  }
  return output;
}

function incrementRandom(bytes: Uint8Array) {
  const output = bytes.slice();
  for (let index = output.length - 1; index >= 0; index -= 1) {
    output[index] = (output[index] + 1) & 0xff;
    if (output[index] !== 0) return output;
  }
  throw new Error("ULID random suffix overflowed within one millisecond.");
}

export function createUlidGenerator(
  randomBytes: RandomBytes = secureRandomBytes,
) {
  let lastTime = -1;
  let lastRandom = new Uint8Array(10);

  return (timestamp = Date.now()) => {
    const effectiveTime = Math.max(timestamp, lastTime);
    if (effectiveTime === lastTime) {
      lastRandom = incrementRandom(lastRandom);
    } else {
      const bytes = randomBytes(10);
      if (bytes.length !== 10) {
        throw new Error("Random source returned too few bytes.");
      }
      lastRandom = bytes.slice();
      lastTime = effectiveTime;
    }
    return `${encodeTime(effectiveTime)}${encodeRandom(lastRandom)}`;
  };
}

const generateUlid = createUlidGenerator();

export function generateNanoId(
  length = 21,
  randomBytes: RandomBytes = secureRandomBytes,
) {
  if (!Number.isInteger(length) || length < 1 || length > 256) {
    throw new Error("NanoID length must be an integer from 1 through 256.");
  }
  const bytes = randomBytes(length);
  if (bytes.length < length) throw new Error("Random source returned too few bytes.");
  return [...bytes]
    .slice(0, length)
    .map((byte) => NANO_ALPHABET[byte & 63])
    .join("");
}

export function generateIdentifiers(
  type: IdentifierType,
  count: number,
  nanoIdLength = 21,
  randomBytes: RandomBytes = secureRandomBytes,
) {
  if (!Number.isInteger(count) || count < 1 || count > 1000) {
    throw new Error("Identifier count must be an integer from 1 through 1,000.");
  }
  const localUlid = createUlidGenerator(randomBytes);
  return Array.from({ length: count }, () => {
    if (type === "uuid") return generateUuid(randomBytes);
    if (type === "ulid") return randomBytes === secureRandomBytes ? generateUlid() : localUlid();
    return generateNanoId(nanoIdLength, randomBytes);
  });
}

