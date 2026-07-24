import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

Object.assign(globalThis, { jest: vi });
Object.defineProperty(window, "scrollTo", {
  configurable: true,
  value: vi.fn(),
});
