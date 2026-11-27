import { createApiClient, demoAllergens } from "@/shared/api";
import { allergensKey, getStatusMessage, isDemoMode } from "@/shared/config";
import { v } from "@/shared/lib/valibot";
import { Allergen } from "../model/types";
import { queryOptions } from "@tanstack/react-query";

async function fetchAllergens() {
  if (isDemoMode()) {
    return v.parse(v.array(Allergen), demoAllergens);
  }

  const client = await createApiClient();
  const { data, error, response } = await client.GET("/allergens");

  if (error) {
    throw new Error(getStatusMessage(response.status));
  }

  return v.parse(v.array(Allergen), data.data);
}

export function allergenQueryOptions() {
  return queryOptions({
    queryFn: fetchAllergens,
    queryKey: allergensKey(),
    staleTime: Infinity,
  });
}
