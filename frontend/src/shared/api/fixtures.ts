import type { components } from "./schema";

// APIレスポンスと同じ形式の固定データ。利用側で既存のschemaをparseする。
// 日時・価格・アレルゲンはデモ用の値で、実店舗の販売情報ではない。
const createdAt = "2026-10-24T10:00:00+09:00";

export const demoAccount: components["schemas"]["MeResponse"] = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "admin@example.com",
  displayName: "デモ管理者",
  pictureUrl: "/avatar-fallback.svg",
  role: "admin",
};

export const demoAllergens: components["schemas"]["Allergen"][] = [
  { id: "00000000-0000-4000-8000-000000000101", name: "卵" },
  { id: "00000000-0000-4000-8000-000000000102", name: "乳" },
  { id: "00000000-0000-4000-8000-000000000103", name: "小麦" },
];

const pancakeStore: components["schemas"]["Store"] = {
  id: "1a172e44-dc24-481c-b787-f24343dd5ce3",
  name: "お金がなければパンケーキを食べればいいじゃない",
  room: "508教室",
  description:
    "当店では、パンケーキを提供いたします。\nトッピングは複数用意しており、お好みに合わせてカスタマイズが可能です。\nコーヒー・紅茶のセット販売も行っておりますので、休憩の際にぜひお立ち寄りください。\n皆様のご来店をお待ちしております。",
  imageUrl: "/mock/pancake-stand/store.jpg",
  reviewStatus: "approved",
  allergens: demoAllergens,
  congestionLevel: 1,
  orderEnabled: true,
  closedAt: null,
};

const takoyakiStore: components["schemas"]["Store"] = {
  id: "8d8f2fd1-f4d8-48f0-b8ec-395b51455fcb",
  name: "たこ焼きングダム",
  room: "507教室",
  description:
    "味の保証はできない。\n理由はキングダムだから。\nなんかふつうにキングダムにででてきたらしい。\nほんとかどうか確かめたいのなら、\nその口で試してみて。",
  imageUrl: "/mock/takoyaki-kingdom/store.jpg",
  reviewStatus: "approved",
  allergens: demoAllergens,
  congestionLevel: 2,
  orderEnabled: true,
  closedAt: null,
};

const wienerStore: components["schemas"]["Store"] = {
  id: "9220baeb-e78f-4dee-9a97-3132f80e9946",
  name: 'ウィンナア"ァ"ァ"ー!!!!!!',
  room: "502教室",
  description:
    "マーモットの楽園へようこそ！野生感を味わえるフォトスポットや、特製の「モットドック」「ウインナァァーーー！」をご用意しています。みんなでマーモットになりきり、美味しく楽しい楽園をお楽しみください！",
  imageUrl: "/mock/wiener-stand/store.jpg",
  reviewStatus: "approved",
  allergens: demoAllergens.filter((allergen) => allergen.name === "小麦"),
  congestionLevel: 3,
  orderEnabled: true,
  closedAt: null,
};

const shootingStore: components["schemas"]["Store"] = {
  id: "cd8c6e4e-996a-4265-9396-031246166631",
  name: "射的チャレンジ",
  room: "505教室",
  description:
    "射的を楽しめるお店です！景品を狙って、ぜひ挑戦してみてください！皆さんのご参加をお待ちしています！",
  imageUrl: "/mock/shooting-gallery/store.jpg",
  reviewStatus: "approved",
  allergens: [],
  congestionLevel: 1,
  orderEnabled: false,
  closedAt: null,
};

// 管理者の申請確認画面用に、1店舗を審査待ちにする。
const cafeStore: components["schemas"]["Store"] = {
  id: "87a106df-c694-4904-bbff-a34d191523d1",
  name: "AIカフェ",
  room: "506教室",
  description:
    "AIを利用した遊び心満載の飲み物屋。AIカフェです！\n私たちは単純に飲み物を提供するだけでは無く注文する際にAIを使った面白い方法で何を頼むか選ぶ事が出来るユニークな体験を同時に提供します！\n是非お越しください！",
  imageUrl: "/mock/ai-cafe/store.jpg",
  reviewStatus: "pending",
  allergens: [],
  congestionLevel: 1,
  orderEnabled: false,
  closedAt: null,
};

export const demoStores: components["schemas"]["Store"][] = [
  pancakeStore,
  takoyakiStore,
  wienerStore,
  shootingStore,
  cafeStore,
];

// fetchActiveRooms()と同じく教室名の配列。
export const demoRooms = demoStores.map((store) => store.room);

export const demoStoreRanking: components["schemas"]["StoreRankingItem"][] = [
  { ...pancakeStore, place: 1 },
  { ...takoyakiStore, place: 2 },
  { ...wienerStore, place: 3 },
];

export const demoStoreApplications = [
  { ...cafeStore, submittedAt: createdAt },
] satisfies components["schemas"]["StoreApplication"][];

export const demoStoreMembers: components["schemas"]["StoreMember"][] = [
  ...demoStores.map((store) => ({
    storeId: store.id,
    accountId: demoAccount.id,
    role: "manager" as const,
    joinedAt: createdAt,
    displayName: demoAccount.displayName,
    pictureUrl: demoAccount.pictureUrl,
  })),
  {
    storeId: pancakeStore.id,
    accountId: "00000000-0000-4000-8000-000000000002",
    role: "staff",
    joinedAt: createdAt,
    displayName: "デモスタッフ",
    pictureUrl: null,
  },
];

const pancakes: components["schemas"]["Menu"] = {
  id: "00000000-0000-4000-8000-000000000201",
  storeId: pancakeStore.id,
  name: "パンケーキ",
  description: "お好みのトッピングを選べるパンケーキです。",
  unitPrice: 300,
  imageUrl: "/mock/pancake-stand/menus/pancakes.jpg",
  soldOut: false,
  createdAt,
  updatedAt: createdAt,
};

const takoyaki: components["schemas"]["Menu"] = {
  id: "00000000-0000-4000-8000-000000000203",
  storeId: takoyakiStore.id,
  name: "たこ焼き",
  description: "ソース味のたこ焼きです。",
  unitPrice: 400,
  imageUrl: "/mock/takoyaki-kingdom/menus/takoyaki.jpg",
  soldOut: false,
  createdAt,
  updatedAt: createdAt,
};

export const demoMenus: components["schemas"]["Menu"][] = [
  pancakes,
  {
    id: "00000000-0000-4000-8000-000000000202",
    storeId: pancakeStore.id,
    name: "コーヒー",
    description: "パンケーキと一緒に楽しめるコーヒーです。",
    unitPrice: 150,
    imageUrl: "/mock/pancake-stand/menus/coffee.jpg",
    soldOut: false,
    createdAt,
    updatedAt: createdAt,
  },
  takoyaki,
  {
    id: "00000000-0000-4000-8000-000000000204",
    storeId: takoyakiStore.id,
    name: "ねぎ塩たこ焼き",
    description: "ねぎと塩だれを合わせたたこ焼きです。",
    unitPrice: 450,
    imageUrl: "/mock/takoyaki-kingdom/menus/green-onion-salt-takoyaki.jpg",
    soldOut: true,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "00000000-0000-4000-8000-000000000205",
    storeId: wienerStore.id,
    name: "ウインナァァーーー！",
    description: "焼きたてのフランクフルトです。",
    unitPrice: 200,
    imageUrl: "/mock/wiener-stand/menus/frankfurter.jpg",
    soldOut: false,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "00000000-0000-4000-8000-000000000206",
    storeId: wienerStore.id,
    name: "モットドック",
    description: "ウインナーをパンにはさんだホットドックです。",
    unitPrice: 350,
    imageUrl: "/mock/wiener-stand/menus/motto-dog.jpg",
    soldOut: false,
    createdAt,
    updatedAt: createdAt,
  },
];

const honey: components["schemas"]["Topping"] = {
  id: "00000000-0000-4000-8000-000000000301",
  storeId: pancakeStore.id,
  name: "はちみつ",
  unitPrice: 50,
  soldOut: false,
  createdAt,
  updatedAt: createdAt,
};

const chocolate: components["schemas"]["Topping"] = {
  id: "00000000-0000-4000-8000-000000000302",
  storeId: pancakeStore.id,
  name: "チョコホイップ",
  unitPrice: 100,
  soldOut: false,
  createdAt,
  updatedAt: createdAt,
};

export const demoToppings: components["schemas"]["Topping"][] = [
  honey,
  chocolate,
];

export const demoMenuToppings: Record<
  string,
  components["schemas"]["Topping"][]
> = {
  [pancakes.id]: [honey, chocolate],
};

const pancakeCartItem: components["schemas"]["CartItem"] = {
  id: "00000000-0000-4000-8000-000000000401",
  menuId: pancakes.id,
  name: pancakes.name,
  imageUrl: pancakes.imageUrl,
  available: true,
  quantity: 2,
  unitPrice: pancakes.unitPrice,
  toppings: [
    {
      id: "00000000-0000-4000-8000-000000000402",
      cartItemId: "00000000-0000-4000-8000-000000000401",
      toppingId: honey.id,
      name: honey.name,
      unitPrice: honey.unitPrice,
      available: true,
    },
  ],
};

export const demoCarts: components["schemas"]["Cart"][] = demoStores.map(
  (store) => ({
    storeId: store.id,
    version: 1,
    totalAmount:
      store.id === pancakeStore.id
        ? (pancakes.unitPrice + honey.unitPrice) * pancakeCartItem.quantity
        : 0,
    items: store.id === pancakeStore.id ? [pancakeCartItem] : [],
  }),
);

// 初期表示用の2注文。5秒後のスナップショットと更新処理は後続手順で追加する。
export const demoOrders: components["schemas"]["Order"][] = [
  {
    id: "00000000-0000-4000-8000-000000000501",
    storeId: pancakeStore.id,
    storeName: pancakeStore.name,
    roomName: pancakeStore.room,
    status: "pending",
    totalAmount:
      (pancakes.unitPrice + honey.unitPrice) * pancakeCartItem.quantity,
    displayNumber: 1,
    version: 1,
    items: [
      {
        id: "00000000-0000-4000-8000-000000000601",
        menuId: pancakes.id,
        menuName: pancakes.name,
        unitPrice: pancakes.unitPrice,
        quantity: pancakeCartItem.quantity,
        toppings: [
          {
            toppingId: honey.id,
            toppingName: honey.name,
            unitPrice: honey.unitPrice,
          },
        ],
      },
    ],
    readyAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: "00000000-0000-4000-8000-000000000502",
    storeId: takoyakiStore.id,
    storeName: takoyakiStore.name,
    roomName: takoyakiStore.room,
    status: "pending",
    totalAmount: takoyaki.unitPrice,
    displayNumber: 2,
    version: 1,
    items: [
      {
        id: "00000000-0000-4000-8000-000000000602",
        menuId: takoyaki.id,
        menuName: takoyaki.name,
        unitPrice: takoyaki.unitPrice,
        quantity: 1,
        toppings: [],
      },
    ],
    readyAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt,
    updatedAt: createdAt,
  },
];
