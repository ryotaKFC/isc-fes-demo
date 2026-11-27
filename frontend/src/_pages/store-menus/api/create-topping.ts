import { Topping, ToppingName, ToppingUnitPrice } from "@/entities/topping";
import { buildDemoCreatedTopping, createApiClient } from "@/shared/api";
import { getStatusMessage, isDemoMode } from "@/shared/config";
import { v } from "@/shared/lib/valibot";

export const CreateToppingInput = v.object({
  name: ToppingName,
  unitPrice: ToppingUnitPrice,
});
export type CreateToppingInput = v.InferOutput<typeof CreateToppingInput>;

type CreateTopping = {
  storeId: string;
  createToppingInput: CreateToppingInput;
};

export async function createTopping({
  storeId,
  createToppingInput,
}: CreateTopping) {
  if (isDemoMode()) {
    return v.parse(
      Topping,
      buildDemoCreatedTopping(storeId, createToppingInput),
    );
  }

  const client = await createApiClient();
  const { data, error, response } = await client.POST(
    "/stores/{store_id}/toppings",
    {
      params: {
        path: {
          store_id: storeId,
        },
      },
      body: {
        name: createToppingInput.name,
        unitPrice: createToppingInput.unitPrice,
      },
    },
  );

  if (error) {
    throw new Error(getStatusMessage(response.status));
  }

  return v.parse(Topping, data);
}
