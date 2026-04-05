import { describe, expect, it } from "bun:test";
import {
  formatBytes,
  formatDuration,
  formatPercent,
  formatRate,
  formatStatusLabel,
  getFileTitle,
  getStatusTone,
} from "./torrserver-utils";

describe("torrserver utils", () => {
  it("formats byte and rate values cleanly", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1024 ** 2 * 3.5)).toBe("3.5 MB");
    expect(formatRate(1024 ** 2)).toBe("1.0 MB/s");
  });

  it("formats duration and percent values", () => {
    expect(formatDuration(59)).toBe("59s");
    expect(formatDuration(61)).toBe("1m 1s");
    expect(formatDuration(3661)).toBe("1h 1m");
    expect(formatPercent(12.345)).toBe("12.3%");
  });

  it("normalizes status labels and tones", () => {
    expect(formatStatusLabel("torrent_in_db")).toBe("Torrent In Db");
    expect(getStatusTone("Torrent working")).toBe("success");
    expect(getStatusTone("Checking server")).toBe("info");
    expect(getStatusTone("Connection failed")).toBe("error");
  });

  it("extracts readable file names from paths", () => {
    expect(getFileTitle("/media/movies/Alien.mkv")).toBe("Alien.mkv");
    expect(getFileTitle("")).toBe("Unnamed file");
  });
});
