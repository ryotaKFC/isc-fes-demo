import { createApiClient, demoStoreApplications } from "@/shared/api";
import {
  getStatusMessage,
  isDemoMode,
  storeApplicationsKey,
} from "@/shared/config";
import { v } from "@/shared/lib/valibot";
import { queryOptions } from "@tanstack/react-query";
import { StoreApplication } from "../model/types";

export function storeApplicationQueryOptions() {
  return queryOptions({
    queryKey: storeApplicationsKey(),
    queryFn: fetchStoreApplications,
  });
}

async function fetchStoreApplications() {
  if (isDemoMode()) {
    return v.parse(v.array(StoreApplication), demoStoreApplications);
  }

  const client = await createApiClient();
  const { data, error, response } = await client.GET("/store-applications");

  if (error) {
    throw new Error(getStatusMessage(response.status));
  }

  return v.parse(v.array(StoreApplication), data.data);
}
