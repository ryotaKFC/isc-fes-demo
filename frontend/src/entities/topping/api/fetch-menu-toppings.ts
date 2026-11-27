import { createApiClient, getDemoMenuToppings } from "@/shared/api";
import { Topping } from "../model/types";
import { v } from "@/shared/lib/valibot";
import { queryOptions } from "@tanstack/react-query";
import {
  getStatusMessage,
  isDemoMode,
  menuToppingsKeys,
} from "@/shared/config";

type FetchMenuToppingsParams = {
  storeId: string;
  menuId: string;
};

export async function fetchMenuToppings({
  storeId,
  menuId,
}: FetchMenuToppingsParams): Promise<Topping[]> {
  if (isDemoMode()) {
    return v.parse(v.array(Topping), getDemoMenuToppings(storeId, menuId));
  }

  const client = await createApiClient();
  const { data, error, response } = await client.GET(
    "/stores/{store_id}/menus/{menu_id}/toppings",
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

  return v.parse(v.array(Topping), data.data);
}

export function menuToppingsQueryOptions({
  menuId,
  storeId,
}: FetchMenuToppingsParams) {
  return queryOptions({
    queryKey: menuToppingsKeys.detail(storeId, menuId),
    queryFn: () => fetchMenuToppings({ storeId, menuId }),
  });
}
