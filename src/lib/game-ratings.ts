import { useEffect, useState } from "react";

export type Rating = "like" | "dislike";
export type Ratings = Record<string, Rating>;
const KEY = "wph-game-ratings";

export function toggleRating(ratings: Ratings, game: string, rating: Rating): Ratings {
  const next = { ...ratings };
  if (next[game] === rating) delete next[game];
  else next[game] = rating;
  return next;
}

export function useGameRatings() {
  const [ratings, setRatings] = useState<Ratings>({});
  useEffect(() => {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "{}");
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        setRatings(Object.fromEntries(Object.entries(raw).filter(([, value]) => value === "like" || value === "dislike")));
      }
    } catch { /* unavailable storage */ }
  }, []);
  const rate = (game: string, rating: Rating) => {
    setRatings((previous) => {
      const next = toggleRating(previous, game, rating);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* unavailable storage */ }
      return next;
    });
  };
  return { ratings, rate };
}