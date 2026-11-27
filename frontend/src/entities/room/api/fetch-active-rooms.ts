import { roomsKey, getStatusMessage, isDemoMode } from "@/shared/config";
import { queryOptions } from "@tanstack/react-query";
import { createApiClient, demoRooms } from "@/shared/api";
import { v } from "@/shared/lib/valibot";
import { Room } from "../model/types";

export async function fetchActiveRooms() {
  if (isDemoMode()) {
    return v.parse(v.array(Room), demoRooms);
  }

  const client = await createApiClient();
  const { data, error, response } = await client.GET("/rooms");

  if (error) {
    throw new Error(getStatusMessage(response.status));
  }

  return v.parse(
    v.array(Room),
    data.data.map((room) => room.name),
  );
}

export function activeRoomsQueryOptions() {
  return queryOptions({
    queryKey: roomsKey(),
    queryFn: fetchActiveRooms,
    staleTime: Infinity,
  });
}
