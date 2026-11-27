import { Order } from "@/entities/order";
import { components, createApiClient, getDemoOrders } from "@/shared/api";
import { getStatusMessage, isClientError, isDemoMode } from "@/shared/config";
import { v } from "@/shared/lib/valibot";

type CreateOrderInput = components["schemas"]["CreateOrderInput"];

export async function createOrder({
  storeId,
  expectedCartVersion,
}: CreateOrderInput): Promise<Order> {
  if (isDemoMode()) {
    const order = getDemoOrders({ storeId })[0];
    if (order === undefined) {
      throw new Error(`デモ用の注文が見つかりません: ${storeId}`);
    }

    return v.parse(Order, order);
  }

  const client = await createApiClient();
  const { data, error, response } = await client.POST("/orders", {
    body: {
      storeId,
      expectedCartVersion,
    },
  });

  if (error) {
    if (isClientError(response.status) && error.message) {
      throw new Error(error.message);
    }

    throw new Error(getStatusMessage(response.status));
  }

  const order = v.parse(Order, data);
  return order;
}
