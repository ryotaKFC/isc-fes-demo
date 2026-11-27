import { createApiClient } from "@/shared/api";
import { getStatusMessage, isDemoMode } from "@/shared/config";

type DeleteMenuParams = {
  storeId: string;
  menuId: string;
};

export async function deleteMenu({ menuId, storeId }: DeleteMenuParams) {
  if (isDemoMode()) {
    return;
  }

  const client = await createApiClient();
  const { error, response } = await client.DELETE(
    "/stores/{store_id}/menus/{menu_id}",
    {
      params: {
        path: {
          store_id: storeId,
          menu_id: menuId,
        },
      },
    },
  );

  if (error) {
    throw new Error(getStatusMessage(response.status));
  }
}
