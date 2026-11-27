import { describe, expect, it } from "vitest";
import {
  buildDemoUpdatedCart,
  buildDemoUpdatedOrder,
  buildDemoUpdatedStore,
  getDemoOrders,
} from "./demo-responses";
import {
  demoAllergens,
  demoMenuToppings,
  demoMenus,
  demoOrders,
  demoStores,
} from "./fixtures";

describe("demo responses", () => {
  it("店舗と状態で注文を絞り込む", () => {
    const order = demoOrders[0]!;

    expect(
      getDemoOrders({ storeId: order.storeId, statuses: ["pending"] }),
    ).toEqual([order]);
    expect(
      getDemoOrders({ storeId: order.storeId, statuses: ["ready"] }),
    ).toEqual([]);
  });

  it("入力した商品とトッピングから更新後のカートを組み立てる", () => {
    const menu = demoMenus.find(
      (candidate) => demoMenuToppings[candidate.id]?.length,
    )!;
    const topping = demoMenuToppings[menu.id]![0]!;

    const cart = buildDemoUpdatedCart(menu.storeId, {
      expectedVersion: 3,
      items: [
        {
          menuId: menu.id,
          quantity: 2,
          toppingIds: [topping.id],
        },
      ],
    });

    expect(cart.version).toBe(4);
    expect(cart.totalAmount).toBe((menu.unitPrice + topping.unitPrice) * 2);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({
      menuId: menu.id,
      quantity: 2,
      toppings: [{ toppingId: topping.id }],
    });
  });

  it("店舗更新では未指定値を維持し、指定した値だけを反映する", () => {
    const store = demoStores[0]!;
    const allergen = demoAllergens[0]!;

    expect(
      buildDemoUpdatedStore(store.id, {
        congestionLevel: 3,
        closed: true,
        allergenIds: [allergen.id],
      }),
    ).toMatchObject({
      id: store.id,
      name: store.name,
      congestionLevel: 3,
      allergens: [allergen],
    });
    expect(
      buildDemoUpdatedStore(store.id, { closed: true }).closedAt,
    ).not.toBeNull();
  });

  it("注文更新ではstatusとversionと日時を整合させる", () => {
    const order = demoOrders[0]!;

    const updated = buildDemoUpdatedOrder(order.storeId, order.id, {
      status: "ready",
      expectedVersion: order.version,
    });

    expect(updated.status).toBe("ready");
    expect(updated.version).toBe(order.version + 1);
    expect(updated.readyAt).not.toBeNull();
    expect(updated.completedAt).toBeNull();
    expect(updated.cancelledAt).toBeNull();
  });
});
