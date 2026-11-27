import { beforeEach, expect, it, vi } from "vitest";
import { createOrder } from "@/_pages/checkout/api/create-order";
import { ensureGuest } from "@/_pages/guest-home/api/ensure-guest";
import { fetchCheckoutable } from "@/_pages/guest-store-detail/api/fetch-checkoutable";
import { fetchOrderById } from "@/_pages/order-detail/api/fetch-order-by-id";
import { createStoreApplication } from "@/_pages/register-store/api/create-store-application";
import { storeApplicationQueryOptions } from "@/_pages/store-applications/api/fetch-store-applications";
import { updateStoreApplicationReviewStatus } from "@/_pages/store-applications/api/updateStoreApplicationReviewStatus";
import { createStoreInvitationUrl } from "@/_pages/store-home/api/create-store-invitation-url";
import { deleteStoreMemberById } from "@/_pages/store-home/api/delete-store-member-by-id";
import { fetchStoreMembers } from "@/_pages/store-home/api/fetch-store-members";
import { createMenu } from "@/_pages/store-menus/api/create-menu";
import { createTopping } from "@/_pages/store-menus/api/create-topping";
import { deleteMenu } from "@/_pages/store-menus/api/delete-menu";
import { deleteTopping } from "@/_pages/store-menus/api/delete-topping";
import { editMenu } from "@/_pages/store-menus/api/edit-menu";
import { editTopping } from "@/_pages/store-menus/api/edit-topping";
import { fetchStoreToppings } from "@/_pages/store-menus/api/fetch-store-toppings";
import { updateOrder } from "@/_pages/store-order-call/api/update-order";
import { fetchCurrentAccountStores } from "@/_pages/stores/api/fetch-current-account-stores";
import { storeInvitationAccept } from "@/app/invites/[id]/_api/store-invitation-accept";
import { allergenQueryOptions } from "@/entities/allergen";
import { fetchCart, updateCart } from "@/entities/cart";
import { storeMenusQueryOptions } from "@/entities/menu";
import { fetchOrders, fetchStoreOrders, OrderStatus } from "@/entities/order";
import { activeRoomsQueryOptions } from "@/entities/room";
import {
  fetchStoreMemberByAccountId,
  StoreMemberRole,
} from "@/entities/store-member";
import {
  fetchStoreDetail,
  fetchVisibleStores,
  StoreReviewStatus,
  storeRankingQueryOptions,
  updateStore,
} from "@/entities/store";
import { menuToppingsQueryOptions } from "@/entities/topping";
import {
  demoAccount,
  demoMenuToppings,
  demoMenus,
  demoOrders,
  demoStores,
  demoToppings,
  uploadImage,
} from "@/shared/api";
import { createReview } from "@/widgets/app-questionnaire/api/create-review";

const mocks = vi.hoisted(() => ({
  createApiClient: vi.fn(),
}));

vi.mock("@/shared/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api")>();
  return { ...actual, createApiClient: mocks.createApiClient };
});

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_APP_MODE", "demo");
  mocks.createApiClient.mockReset();
  mocks.createApiClient.mockRejectedValue(
    new Error("デモモードでAPIクライアントが呼ばれました"),
  );
});

it("対象APIはデモモードでHTTPクライアントを呼ばずに結果を返す", async () => {
  const store = demoStores[0]!;
  const menu = demoMenus.find((candidate) => candidate.storeId === store.id)!;
  const topping = (demoMenuToppings[menu.id] ?? demoToppings)[0]!;
  const order = demoOrders.find((candidate) => candidate.storeId === store.id)!;
  const queryContext = {} as never;
  const image = {} as File;

  await Promise.all([
    fetchVisibleStores(),
    fetchStoreDetail(store.id),
    storeRankingQueryOptions().queryFn!(queryContext),
    updateStore({ storeId: store.id, input: { congestionLevel: 2 } }),
    fetchCart({ storeId: store.id }),
    updateCart({
      storeId: store.id,
      updateCartInput: {
        expectedVersion: 1,
        items: [{ menuId: menu.id, quantity: 1, toppingIds: [] }],
      },
    }),
    storeMenusQueryOptions(store.id).queryFn!(queryContext),
    fetchOrders([OrderStatus.Pending]),
    fetchStoreOrders({
      storeId: store.id,
      statuses: [OrderStatus.Pending],
    }),
    activeRoomsQueryOptions().queryFn!(queryContext),
    allergenQueryOptions().queryFn!(queryContext),
    menuToppingsQueryOptions({
      storeId: store.id,
      menuId: menu.id,
    }).queryFn!(queryContext),
    fetchStoreMemberByAccountId({
      storeId: store.id,
      accountId: demoAccount.id,
    }),
    fetchOrderById({ orderId: order.id }),
    fetchCheckoutable(store.id, 1),
    storeApplicationQueryOptions().queryFn!(queryContext),
    fetchStoreMembers(store.id),
    fetchStoreToppings({ storeId: store.id }),
    fetchCurrentAccountStores(),
    ensureGuest(),
    createOrder({ storeId: store.id, expectedCartVersion: 1 }),
    updateOrder({
      storeId: store.id,
      orderId: order.id,
      input: { status: "ready", expectedVersion: order.version },
    }),
    createStoreApplication({
      createStoreInput: {
        name: "デモ店舗",
        room: "508教室",
        description: "デモ用の店舗申請です。",
        allergenIds: [],
        image,
        orderEnabled: true,
      },
    }),
    updateStoreApplicationReviewStatus({
      storeId: store.id,
      status: StoreReviewStatus.Approved,
    }),
    createStoreInvitationUrl({
      origin: "https://example.com",
      storeId: store.id,
      maxUses: 1,
      role: StoreMemberRole.Staff,
    }),
    deleteStoreMemberById({
      storeId: store.id,
      accountId: demoAccount.id,
    }),
    storeInvitationAccept("00000000-0000-4000-8000-000000000904"),
    createMenu({
      storeId: store.id,
      createMenuInput: {
        name: "デモメニュー",
        description: "デモ用のメニューです。",
        unitPrice: 500,
        toppingIds: [],
        image,
      },
    }),
    editMenu({
      storeId: store.id,
      menuId: menu.id,
      editMenuInput: { soldOut: true },
    }),
    deleteMenu({ storeId: store.id, menuId: menu.id }),
    createTopping({
      storeId: store.id,
      createToppingInput: { name: "デモトッピング", unitPrice: 100 },
    }),
    editTopping({
      storeId: topping.storeId,
      toppingId: topping.id,
      editToppingInput: { soldOut: true },
    }),
    deleteTopping({
      storeId: topping.storeId,
      toppingId: topping.id,
    }),
    uploadImage(image),
    createReview({ rating: 5, trigger: "demo" }),
  ]);

  expect(mocks.createApiClient).not.toHaveBeenCalled();
});
