import { useState, useEffect, useCallback } from "react";
import { getReviews } from "../api/client";
import { Review } from "../types";

const newestFirst = (a: Review, b: Review) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

// The backend is the single source of truth. Nothing is cached in the browser,
// so the list always matches the Analytics tab.
export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReviews();
      setReviews([...data].sort(newestFirst));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Show a just-created review immediately, without duplicating it on refresh.
  const addReview = useCallback((review: Review) => {
    setReviews((prev) => [review, ...prev.filter((r) => r.id !== review.id)]);
  }, []);

  return { reviews, loading, error, refresh, addReview };
}
