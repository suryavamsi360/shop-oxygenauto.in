import { describe, expect, it } from "vitest";

import { resolveApiBaseUrl } from "./api";

describe("resolveApiBaseUrl", () => {
  it.each(["localhost", "127.0.0.1", "::1"])(
    "uses the local API for %s",
    (hostname) => {
      expect(
        resolveApiBaseUrl(hostname, "https://api.example.com/api"),
      ).toBe("http://localhost:8000/api");
    },
  );

  it("uses the configured API for a deployed hostname", () => {
    expect(
      resolveApiBaseUrl(
        "oxygenautoparts.in",
        "https://api-oxygen-auto.onrender.com/api",
      ),
    ).toBe("https://api-oxygen-auto.onrender.com/api");
  });
});