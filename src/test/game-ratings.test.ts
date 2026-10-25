import { describe, expect, it } from "vitest";
import { toggleRating } from "@/lib/game-ratings";

describe("game ratings", () => {
  it("saves one rating per game and clears it when clicked again", () => {
    const liked = toggleRating({}, "geometry", "like");
    expect(toggleRating(liked, "geometry", "dislike")).toEqual({ geometry: "dislike" });
    expect(toggleRating(liked, "geometry", "like")).toEqual({});
  });
});