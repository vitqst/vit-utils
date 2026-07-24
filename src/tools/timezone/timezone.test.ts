import { describe, expect, it } from "vitest";

import {
  convertTimeZones,
  resolveZonedDateTime,
} from "./timezone";

describe("timezone conversion", () => {
  it("resolves wall times with IANA offsets and converts one instant", () => {
    expect(
      resolveZonedDateTime("2026-01-01T07:00", "Asia/Ho_Chi_Minh"),
    ).toMatchObject({
      iso: "2026-01-01T00:00:00.000Z",
      ambiguous: false,
    });
    expect(
      resolveZonedDateTime("2026-07-01T12:00", "America/New_York"),
    ).toMatchObject({
      iso: "2026-07-01T16:00:00.000Z",
      ambiguous: false,
    });
  });

  it("marks repeated fallback times and chooses the earlier instant", () => {
    expect(
      resolveZonedDateTime("2026-11-01T01:30", "America/New_York"),
    ).toMatchObject({
      iso: "2026-11-01T05:30:00.000Z",
      ambiguous: true,
    });
  });

  it("rejects nonexistent DST times and invalid zones", () => {
    expect(() =>
      resolveZonedDateTime("2026-03-08T02:30", "America/New_York"),
    ).toThrow(/does not exist/i);
    expect(() =>
      resolveZonedDateTime("2026-01-01T00:00", "Mars/Olympus"),
    ).toThrow(/time zone/i);
  });

  it("formats selected target zones from the same instant", () => {
    const result = convertTimeZones(
      "2026-01-01T07:00",
      "Asia/Ho_Chi_Minh",
      ["UTC", "America/New_York"],
      "en",
    );
    expect(result.iso).toBe("2026-01-01T00:00:00.000Z");
    expect(result.targets).toHaveLength(2);
    expect(result.targets[0]).toMatchObject({ zone: "UTC", offset: "GMT" });
    expect(result.targets[1].formatted).toMatch(/Dec.*31.*2025/i);
  });
});

