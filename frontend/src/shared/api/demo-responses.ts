import type { components } from "./schema";
import {
  demoAllergens,
  demoCarts,
  demoMenuToppings,
  demoMenus,
  demoOrders,
  demoStoreMembers,
  demoStores,
  demoToppings,
} from "./fixtures";

const demoMutationAt = "2026-10-24T10:05:00+09:00";

export function findDemoStore(storeId: string) {
  return demoStores.find((store) => store.id === storeId);
}

export function findDemoStoreMember(storeId: string, accountId: string) {
  return demoStoreMembers.find(
    (member) => member.storeId === storeId && member.accountId === accountId,
  );
}

export function findDemoOrder(orderId: string) {
  return demoOrders.find((order) => order.id === orderId);
}

export function getDemoCart(storeId: string) {
  return (
    demoCarts.find((cart) => cart.storeId === storeId) ?? {
      storeId,
      version: 1,
      totalAmount: 0,
      items: [],
    }
  );
}

export function getDemoMenus(storeId: string) {
  return demoMenus.filter((menu) => menu.storeId === storeId);
}

export function getDemoToppings(storeId: string) {
  return demoToppings.filter((topping) => topping.storeId === storeId);
}

export function getDemoMenuToppings(storeId: string, menuId: string) {
  return (demoMenuToppings[menuId] ?? []).filter(
    (topping) => topping.storeId === storeId,
  );
}

type DemoOrderFilter = {
  storeId?: string;
  statuses?: components["schemas"]["OrderStatus"][];
};

export function getDemoOrders({ storeId, statuses }: DemoOrderFilter = {}) {
  return demoOrders.filter((order) => {
    if (storeId !== undefined && order.storeId !== storeId) {
      return false;
    }

    if (statuses !== undefined && !statuses.includes(order.status)) {
      return false;
    }

    return true;
  });
}

export function buildDemoUpdatedStore(
  storeId: string,
  input: components["schemas"]["UpdateStoreInput"],
) {
  const store = requireDemoValue(findDemoStore(storeId), "店舗", storeId);
  const allergens =
    input.allergenIds === undefined
      ? store.allergens
      : demoAllergens.filter((allergen) =>
          input.allergenIds?.includes(allergen.id),
        );

  let closedAt = store.closedAt;
  if (input.closed !== undefined) {
    closedAt = input.closed ? demoMutationAt : null;
  }

  return {
    ...store,
    room: input.room ?? store.room,
    description: input.description ?? store.description,
    orderEnabled: input.orderEnabled ?? store.orderEnabled,
    congestionLevel: input.congestionLevel ?? store.congestionLevel,
    allergens,
    closedAt,
  } satisfies components["schemas"]["Store"];
}

export function buildDemoUpdatedCart(
  storeId: string,
  input: components["schemas"]["UpdateCartInput"],
) {
  const items = input.items.map((item, itemIndex) => {
    const menu = requireDemoValue(
      demoMenus.find(
        (candidate) =>
          candidate.storeId === storeId && candidate.id === item.menuId,
      ),
      "メニュー",
      item.menuId,
    );
    const cartItemId =
      item.id ??
      `00000000-0000-4000-8000-${String(700 + itemIndex).padStart(12, "0")}`;
    const toppings = item.toppingIds.map((toppingId, toppingIndex) => {
      const topping = requireDemoValue(
        getDemoMenuToppings(storeId, item.menuId).find(
          (candidate) => candidate.id === toppingId,
        ),
        "トッピング",
        toppingId,
      );

      return {
        id: `00000000-0000-4000-8000-${String(800 + itemIndex * 10 + toppingIndex).padStart(12, "0")}`,
        cartItemId,
        toppingId: topping.id,
        name: topping.name,
        unitPrice: topping.unitPrice,
        available: !topping.soldOut,
      };
    });

    return {
      id: cartItemId,
      menuId: menu.id,
      name: menu.name,
      imageUrl: menu.imageUrl,
      available: !menu.soldOut,
      quantity: item.quantity,
      unitPrice: menu.unitPrice,
      toppings,
    };
  });
  const totalAmount = items.reduce((total, item) => {
    const toppingsTotal = item.toppings.reduce(
      (subtotal, topping) => subtotal + topping.unitPrice,
      0,
    );
    return total + (item.unitPrice + toppingsTotal) * item.quantity;
  }, 0);

  return {
    storeId,
    version: input.expectedVersion + 1,
    totalAmount,
    items,
  } satisfies components["schemas"]["Cart"];
}

export function buildDemoUpdatedOrder(
  storeId: string,
  orderId: string,
  input: components["schemas"]["UpdateOrderInput"],
) {
  const order = requireDemoValue(findDemoOrder(orderId), "注文", orderId);
  if (order.storeId !== storeId) {
    throw new Error(
      `デモ用の注文 ${orderId} は店舗 ${storeId} に属していません`,
    );
  }

  const isReadyOrCompleted =
    input.status === "ready" || input.status === "completed";

  return {
    ...order,
    status: input.status,
    version: input.expectedVersion + 1,
    readyAt: isReadyOrCompleted ? (order.readyAt ?? demoMutationAt) : null,
    completedAt: input.status === "completed" ? demoMutationAt : null,
    cancelledAt: input.status === "cancelled" ? demoMutationAt : null,
    updatedAt: demoMutationAt,
  } satisfies components["schemas"]["Order"];
}

type DemoMenuInput = Omit<
  components["schemas"]["CreateMenuInput"],
  "imageObjectKey"
>;

export function buildDemoCreatedMenu(storeId: string, input: DemoMenuInput) {
  return {
    id: "00000000-0000-4000-8000-000000000901",
    storeId,
    name: input.name,
    description: input.description,
    unitPrice: input.unitPrice,
    imageUrl: "/mock/pancake-stand/menus/pancakes.jpg",
    soldOut: false,
    createdAt: demoMutationAt,
    updatedAt: demoMutationAt,
  } satisfies components["schemas"]["Menu"];
}

export function buildDemoEditedMenu(
  storeId: string,
  menuId: string,
  input: components["schemas"]["UpdateMenuInput"],
) {
  const menu = requireDemoValue(
    demoMenus.find(
      (candidate) => candidate.storeId === storeId && candidate.id === menuId,
    ),
    "メニュー",
    menuId,
  );

  return {
    ...menu,
    name: input.name ?? menu.name,
    description: input.description ?? menu.description,
    unitPrice: input.unitPrice ?? menu.unitPrice,
    soldOut: input.soldOut ?? menu.soldOut,
    updatedAt: demoMutationAt,
  } satisfies components["schemas"]["Menu"];
}

export function buildDemoCreatedTopping(
  storeId: string,
  input: components["schemas"]["CreateToppingInput"],
) {
  return {
    id: "00000000-0000-4000-8000-000000000902",
    storeId,
    name: input.name,
    unitPrice: input.unitPrice,
    soldOut: false,
    createdAt: demoMutationAt,
    updatedAt: demoMutationAt,
  } satisfies components["schemas"]["Topping"];
}

export function buildDemoEditedTopping(
  storeId: string,
  toppingId: string,
  input: components["schemas"]["UpdateToppingInput"],
) {
  const topping = requireDemoValue(
    demoToppings.find(
      (candidate) =>
        candidate.storeId === storeId && candidate.id === toppingId,
    ),
    "トッピング",
    toppingId,
  );

  return {
    ...topping,
    name: input.name ?? topping.name,
    unitPrice: input.unitPrice ?? topping.unitPrice,
    soldOut: input.soldOut ?? topping.soldOut,
    updatedAt: demoMutationAt,
  } satisfies components["schemas"]["Topping"];
}

function requireDemoValue<T>(
  value: T | undefined,
  resourceName: string,
  id: string,
): T {
  if (value === undefined) {
    throw new Error(`デモ用の${resourceName}が見つかりません: ${id}`);
  }

  return value;
}
