"use client";

import { useEffect } from "react";
import { ensureGuest } from "../api/ensure-guest";

export function GuestSessionInitializer() {
  useEffect(() => {
    ensureGuest().catch(() => {
      // カート更新時にも発行されるため、ホームでの失敗は操作を妨げない。
    });
  }, []);

  return null;
}
