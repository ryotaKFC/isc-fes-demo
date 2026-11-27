import { StoreReviewStatus } from "@/entities/store";
import { createApiClient } from "@/shared/api";
import { getStatusMessage, isDemoMode } from "@/shared/config";

type UpdateStoreApplicationReviewStatusProps = {
  storeId: string;
  status: StoreReviewStatus;
};
export async function updateStoreApplicationReviewStatus({
  storeId,
  status,
}: UpdateStoreApplicationReviewStatusProps) {
  if (isDemoMode()) {
    return;
  }

  const client = await createApiClient();
  const { error, response } = await client.PUT(
    "/store-applications/review-status/{store_id}",
    {
      params: { path: { store_id: storeId } },
      body: { reviewStatus: status },
    },
  );

  if (error) {
    throw new Error(getStatusMessage(response.status));
  }
}
