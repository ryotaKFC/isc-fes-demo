import { createApiClient } from "@/shared/api";
import { getStatusMessage, isDemoMode } from "@/shared/config";

type CreateReviewParams = {
  rating: number;
  comment?: string;
  trigger: string;
};

export async function createReview(input: CreateReviewParams) {
  if (isDemoMode()) {
    return {
      id: "00000000-0000-4000-8000-000000000903",
      createdAt: "2026-10-24T10:05:00+09:00",
    };
  }

  const client = await createApiClient();

  const { data, error, response } = await client.POST("/reviews", {
    body: input,
  });

  if (error) {
    throw new Error(getStatusMessage(response.status));
  }

  return data;
}
