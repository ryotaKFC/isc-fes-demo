import { createApiClient } from "@/shared/api";
import { getStatusMessage, isDemoMode } from "@/shared/config";

type DeleteToppingParams = {
  storeId: string;
  toppingId: string;
};

export async function deleteTopping({
  toppingId,
  storeId,
}: DeleteToppingParams) {
  if (isDemoMode()) {
    return;
  }

  const client = await createApiClient();
  const { error, response } = await client.DELETE(
    "/stores/{store_id}/toppings/{topping_id}",
    {
      params: {
        path: {
          store_id: storeId,
          topping_id: toppingId,
        },
      },
    },
  );

  if (error) {
    throw new Error(getStatusMessage(response.status));
  }
}
