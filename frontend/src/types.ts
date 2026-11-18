export type ReviewStatus = "new" | "processing" | "resolved" | "escalated";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ReviewHistoryItem {
  timestamp: string;
  message: string;
  actor: "system" | "agent" | "user";
}

export interface Review {
  id: string;
  pr_title: string;
  status: ReviewStatus;
  risk_level: RiskLevel;
  change_type: string;
  createdAt: string;
  code_diff?: string;
  history?: ReviewHistoryItem[];
  // Optional fields the backend may include. The UI shows them only when present.
  reviewComment?: string;
  review_comment?: string;
  comment?: string;
  assigned_reviewer?: string;
  needs_human_review?: boolean;
  agents_run?: string[];
}

export interface ReviewStats {
  totalReviews: number;
  escalated: number;
  normal: number;
  agents_frequency?: Record<string, number>;
  change_types?: Record<string, number>;
  risk_levels?: Record<string, number>;
}

export interface RagAnswer {
  question: string;
  answer: string;
  sources: string[];
  chunks_used: number;
  error?: string;
}
