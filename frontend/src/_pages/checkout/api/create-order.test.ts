import { beforeEach, expect, it, vi } from "vitest";
import { createOrder } from "./create-order";
import { createApiClient } from "@/shared/api";

vi.mock("@/shared/api", () => ({ createApiClient: vi.fn() }));

const post = vi.fn();
const input = { storeId: "store-123", expectedCartVersion: 1 };

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_APP_MODE", "api-test");
  vi.clearAllMocks();
  vi.mocked(createApiClient).mockResolvedValue({
    POST: post,
  } as unknown as Awaited<ReturnType<typeof createApiClient>>);
});

it("待機時間の拒否をサーバーの文言で返す", async () => {
  const message =
    "初回閲覧から3分は注文できません。もう少し時間を置いてから注文してください";
  post.mockResolvedValue({
    error: { code: "guest_order_too_early", message },
    response: new Response(null, { status: 403 }),
  });

  await expect(createOrder(input)).rejects.toThrow(message);
});

it.each([
  [
    403,
    undefined,
    "店舗は注文受付を停止しています",
    "店舗は注文受付を停止しています",
  ],
  [
    409,
    undefined,
    "カートが更新されています。再読み込みしてください",
    "カートが更新されています。再読み込みしてください",
  ],
  [
    500,
    "guest_order_too_early",
    "サーバー内部でエラーが発生しました",
    "エラーが発生しました。時間を置いて再度試してください。",
  ],
])(
  "注文エラーの文言を返す（%s）",
  async (status, code, message, expectedMessage) => {
    post.mockResolvedValue({
      error: { code, message },
      response: new Response(null, { status }),
    });

    await expect(createOrder(input)).rejects.toThrow(expectedMessage);
  },
);
