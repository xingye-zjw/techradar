import { describe, it, expect } from "vitest";
import type { TrackId as TrackIdCT } from "@/lib/content-types";
import { ROADMAP_TRACKS } from "@/lib/content-types";
import type { TrackId as TrackIdConst } from "@/lib/constants";
import { TRACK_COLORS, TRACK_LABELS, TRACK_ORDER } from "@/lib/constants";

describe("Q-01: TrackId 单一来源合并验证", () => {
  it("① TRACK_COLORS/LABELS/ORDER 的 keys 与 ROADMAP_TRACKS.id 完全一致（无遗漏无多余）", () => {
    const roadmapIds = ROADMAP_TRACKS.map((t) => t.id).sort();
    const colorsKeys = Object.keys(TRACK_COLORS).sort() as TrackIdCT[];
    const labelsKeys = Object.keys(TRACK_LABELS).sort() as TrackIdCT[];
    const orderSorted = [...TRACK_ORDER].sort() as TrackIdCT[];

    expect(roadmapIds).toEqual(colorsKeys);
    expect(roadmapIds).toEqual(labelsKeys);
    expect(roadmapIds).toEqual(orderSorted);

    expect(colorsKeys.length).toBe(12);
    expect(new Set(roadmapIds).size).toBe(12);
  });

  it("② TrackId 类型兼容性：两个来源的 12 个值互兼容（运行时数组 satisfies 断言）", () => {
    const allIds: readonly TrackIdCT[] = ROADMAP_TRACKS.map((t) => t.id);

    const asConstType: readonly TrackIdConst[] = allIds satisfies readonly TrackIdCT[];

    expect(allIds.length).toBe(12);
    expect(asConstType.length).toBe(12);

    expect(allIds.includes("cv" as TrackIdCT)).toBe(true);
    expect(allIds.includes("project" as TrackIdCT)).toBe(true);
    expect(allIds.includes("electrical" as TrackIdCT)).toBe(true);
  });

  it("附加验证：TRACK_LABELS 与 ROADMAP_TRACKS.name 完全一致", () => {
    for (const track of ROADMAP_TRACKS) {
      expect(TRACK_LABELS[track.id]).toBe(track.name);
    }
  });
});
