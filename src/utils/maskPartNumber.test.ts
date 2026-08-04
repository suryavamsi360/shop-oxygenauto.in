import { describe, expect, it } from "vitest";

import { maskPartNumber } from "./maskPartNumber";

describe("maskPartNumber", () => {
  it("shows only the final four characters", () => {
    expect(maskPartNumber("PART-123456")).toBe("*******3456");
  });

  it("fully masks short values and handles empty values", () => {
    expect(maskPartNumber("PN-1")).toBe("****");
    expect(maskPartNumber("  ")).toBe("-");
  });
});