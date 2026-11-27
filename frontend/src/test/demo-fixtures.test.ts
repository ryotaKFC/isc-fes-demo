import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { Account, AccountRole } from "@/entities/account";
import { Allergen } from "@/entities/allergen";
import { Cart } from "@/entities/cart";
import { Menu } from "@/entities/menu";
import { Order, OrderStatus } from "@/entities/order";
import { Room } from "@/entities/room";
import { Store, StoreReviewStatus } from "@/entities/store";
import { StoreMember, StoreMemberRole } from "@/entities/store-member";
import { Topping } from "@/entities/topping";
import { StoreApplication } from "@/_pages/store-applications/model/types";
import {
  demoAccount,
  demoAllergens,
  demoCarts,
  demoMenus,
  demoMenuToppings,
  demoOrders,
  demoRooms,
  demoStoreApplications,
  demoStoreMembers,
  demoStoreRanking,
  demoStores,
  demoToppings,
} from "@/shared/api";
import { v } from "@/shared/lib/valibot";

describe("デモ用fixture", () => {
  it("既存のschemaでparseでき、日時がDateに変換される", () => {
    expect(v.parse(Account, demoAccount).role).toBe(AccountRole.Admin);
    v.parse(v.array(Allergen), demoAllergens);
    v.parse(v.array(Store), demoStores);
    v.parse(v.array(Room), demoRooms);
    v.parse(v.array(Cart), demoCarts);
    v.parse(v.array(Store), demoStoreRanking);
    expect(
      v
        .parse(v.array(Menu), demoMenus)
        .every(
          (menu) =>
            menu.createdAt instanceof Date && menu.updatedAt instanceof Date,
        ),
    ).toBe(true);
    expect(
      v
        .parse(v.array(Topping), demoToppings)
        .every(
          (topping) =>
            topping.createdAt instanceof Date &&
            topping.updatedAt instanceof Date,
        ),
    ).toBe(true);
    expect(
      v
        .parse(v.array(StoreMember), demoStoreMembers)
        .every((member) => member.joinedAt instanceof Date),
    ).toBe(true);
    expect(
      v
        .parse(v.array(StoreApplication), demoStoreApplications)
        .every((application) => application.submittedAt instanceof Date),
    ).toBe(true);
    expect(
      v
        .parse(v.array(Order), demoOrders)
        .every((order) => order.createdAt instanceof Date),
    ).toBe(true);
  });

  it("各レコードのIDが重複せず、教室・店舗・アレルゲンの参照先が存在する", () => {
    for (const records of [
      demoStores,
      demoMenus,
      demoToppings,
      demoOrders,
      demoAllergens,
    ]) {
      expect(new Set(records.map((record) => record.id)).size).toBe(
        records.length,
      );
    }

    for (const store of demoStores) {
      expect(demoRooms).toContain(store.room);
      for (const allergen of store.allergens) {
        expect(demoAllergens).toContainEqual(allergen);
      }
    }

    for (const record of [
      ...demoMenus,
      ...demoToppings,
      ...demoCarts,
      ...demoStoreMembers,
    ]) {
      expect(demoStores.some((store) => store.id === record.storeId)).toBe(
        true,
      );
    }

    for (const [menuId, toppings] of Object.entries(demoMenuToppings)) {
      const menu = demoMenus.find((menu) => menu.id === menuId);
      expect(menu).toBeDefined();
      for (const topping of toppings) {
        expect(demoToppings).toContainEqual(topping);
        expect(topping.storeId).toBe(menu?.storeId);
      }
    }
  });

  it("ローカルの画像がすべて存在する", () => {
    const imageUrls = [
      demoAccount.pictureUrl,
      ...demoStores.map((store) => store.imageUrl),
      ...demoMenus.map((menu) => menu.imageUrl),
      ...demoStoreMembers.map((member) => member.pictureUrl),
      ...demoCarts.flatMap((cart) => cart.items.map((item) => item.imageUrl)),
    ];

    for (const imageUrl of imageUrls) {
      if (imageUrl === null) continue;
      expect(imageUrl.startsWith("/")).toBe(true);
      const path = fileURLToPath(
        new URL(`../../public${imageUrl}`, import.meta.url),
      );
      expect(existsSync(path), imageUrl).toBe(true);
    }
  });

  it("承認済み店舗のランキングと審査待ち申請、固定Adminの所属が整合する", () => {
    expect(demoStoreRanking.map((store) => store.place)).toEqual([1, 2, 3]);
    for (const { place: _place, ...store } of demoStoreRanking) {
      expect(store.reviewStatus).toBe(StoreReviewStatus.Approved);
      expect(demoStores).toContainEqual(store);
    }

    expect(demoStoreApplications.length).toBeGreaterThan(0);
    for (const {
      submittedAt: _submittedAt,
      ...store
    } of demoStoreApplications) {
      expect(store.reviewStatus).toBe(StoreReviewStatus.Pending);
      expect(demoStores).toContainEqual(store);
    }

    for (const store of demoStores) {
      expect(demoStoreMembers).toContainEqual({
        storeId: store.id,
        accountId: demoAccount.id,
        role: StoreMemberRole.Manager,
        joinedAt: expect.any(String),
        displayName: demoAccount.displayName,
        pictureUrl: demoAccount.pictureUrl,
      });
    }
  });

  it("カートの商品・トッピング・数量・合計金額が整合する", () => {
    expect(demoCarts.some((cart) => cart.items.length > 0)).toBe(true);
    for (const cart of demoCarts) {
      expect(cart.items.length).toBeLessThanOrEqual(3);
      for (const item of cart.items) {
        const menu = demoMenus.find((menu) => menu.id === item.menuId);
        expect(menu).toMatchObject({
          storeId: cart.storeId,
          name: item.name,
          unitPrice: item.unitPrice,
          imageUrl: item.imageUrl,
          soldOut: !item.available,
        });
        expect(item.quantity).toBeGreaterThanOrEqual(1);
        expect(item.quantity).toBeLessThanOrEqual(10);
        for (const topping of item.toppings) {
          expect(topping.cartItemId).toBe(item.id);
          expect(demoMenuToppings[item.menuId]).toContainEqual(
            expect.objectContaining({
              id: topping.toppingId,
              name: topping.name,
              unitPrice: topping.unitPrice,
              soldOut: !topping.available,
            }),
          );
        }
      }
      expect(cart.totalAmount).toBe(
        cart.items.reduce(
          (total, item) =>
            total +
            (item.unitPrice +
              item.toppings.reduce(
                (sum, topping) => sum + topping.unitPrice,
                0,
              )) *
              item.quantity,
          0,
        ),
      );
    }
  });

  it("初期注文は異なる店舗のpendingが2件で、明細・金額・日時が整合する", () => {
    expect(demoOrders).toHaveLength(2);
    expect(new Set(demoOrders.map((order) => order.storeId)).size).toBe(2);
    for (const order of demoOrders) {
      expect(order.status).toBe(OrderStatus.Pending);
      expect(order.version).toBe(1);
      expect(order.readyAt).toBeNull();
      expect(order.completedAt).toBeNull();
      expect(order.cancelledAt).toBeNull();
      expect(Date.parse(order.updatedAt)).toBe(Date.parse(order.createdAt));
      expect(demoStores).toContainEqual(
        expect.objectContaining({
          id: order.storeId,
          name: order.storeName,
          room: order.roomName,
          reviewStatus: StoreReviewStatus.Approved,
          orderEnabled: true,
        }),
      );
      for (const item of order.items) {
        expect(demoMenus).toContainEqual(
          expect.objectContaining({
            id: item.menuId,
            storeId: order.storeId,
            name: item.menuName,
            unitPrice: item.unitPrice,
          }),
        );
        for (const topping of item.toppings) {
          expect(demoMenuToppings[item.menuId]).toContainEqual(
            expect.objectContaining({
              id: topping.toppingId,
              name: topping.toppingName,
              unitPrice: topping.unitPrice,
            }),
          );
        }
      }
      expect(order.totalAmount).toBe(
        order.items.reduce(
          (total, item) =>
            total +
            (item.unitPrice +
              item.toppings.reduce(
                (sum, topping) => sum + topping.unitPrice,
                0,
              )) *
              item.quantity,
          0,
        ),
      );
    }
  });
});
