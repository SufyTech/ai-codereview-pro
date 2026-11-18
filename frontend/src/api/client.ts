import { RagAnswer, Review, ReviewStats } from "../types.ts";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readDetail(res: Response): Promise<string | undefined> {
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") return body.detail;
  } catch {
    /* body was not JSON */
  }
  return undefined;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(
      "Can't reach the backend. It runs on free hosting and sleeps when idle, so wait about a minute and try again.",
      0,
    );
  }
  if (!res.ok) {
    const detail = await readDetail(res);
    throw new ApiError(
      detail ?? `The backend returned an error (status ${res.status}).`,
      res.status,
    );
  }
  return res.json() as Promise<T>;
}

export const getReviews = () => request<Review[]>("/api/reviews");

export const getReviewStats = () => request<ReviewStats>("/api/reviews/stats");

export async function createReview(payload: {
  pr_title: string;
  code_diff: string;
}): Promise<Review> {
  try {
    return await request<Review>("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 503) {
      // The backend returns 503 when the AI call fails, instead of a made-up review.
      throw new ApiError(
        "The AI model did not respond, or the server is still waking up. Nothing was faked. Try again in a minute.",
        503,
      );
    }
    throw err;
  }
}

export async function askKnowledgeBase(question: string): Promise<RagAnswer> {
  const data = await request<RagAnswer>("/api/rag/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (data.error) throw new ApiError(data.error, 200);
  return data;
}
