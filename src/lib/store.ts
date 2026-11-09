"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, View } from "./data";

export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  colorName: string;
  colorHex: string;
  size: string;
  qty: number;
}

export interface Address {
  id: string;
  recipient: string;
  phone: string;
  province: string;
  city: string;
  postal: string;
  detail: string;
}

export interface Order {
  id: string;
  date: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: CartItem[];
}

interface AppState {
  // navigation
  view: View;
  activeProductId: string | null;
  plpSlug: string | null; // category slug for listing
  plpTitle: string | null;

  setView: (v: View) => void;
  openProduct: (id: string) => void;
  openListing: (slug: string, title: string) => void;

  // cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  updateQty: (index: number, qty: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cartCount: () => number;
  cartSubtotal: () => number;
  cartDiscount: () => number;

  // wishlist
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;

  // applied promo code
  promoCode: string | null;
  promoDiscount: number; // toman off
  applyPromo: (code: string) => { ok: boolean; message: string };
  clearPromo: () => void;

  // auth
  isAuthed: boolean;
  phone: string | null;
  userName: string;
  login: (phone: string, name?: string) => void;
  logout: () => void;

  // addresses
  addresses: Address[];
  addAddress: (a: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;

  // orders
  orders: Order[];
  addOrder: (o: Order) => void;
}

const PROMOS: Record<string, number> = {
  LUXA10: 0.1,
  WELCOME15: 0.15,
  FEST20: 0.2,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      view: "home",
      activeProductId: null,
      plpSlug: null,
      plpTitle: null,

      setView: (v) => {
        set({ view: v });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },
      openProduct: (id) => {
        set({ view: "pdp", activeProductId: id });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },
      openListing: (slug, title) => {
        set({ view: "plp", plpSlug: slug, plpTitle: title });
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },

      cart: [],
      addToCart: (item, qty = 1) =>
        set((s) => {
          const idx = s.cart.findIndex(
            (c) =>
              c.productId === item.productId &&
              c.colorName === item.colorName &&
              c.size === item.size,
          );
          if (idx >= 0) {
            const next = [...s.cart];
            next[idx] = { ...next[idx], qty: next[idx].qty + qty };
            return { cart: next };
          }
          return { cart: [...s.cart, { ...item, qty }] };
        }),
      updateQty: (index, qty) =>
        set((s) => {
          if (qty <= 0) {
            return { cart: s.cart.filter((_, i) => i !== index) };
          }
          const next = [...s.cart];
          next[index] = { ...next[index], qty };
          return { cart: next };
        }),
      removeFromCart: (index) =>
        set((s) => ({ cart: s.cart.filter((_, i) => i !== index) })),
      clearCart: () => set({ cart: [], promoCode: null, promoDiscount: 0 }),
      cartCount: () => get().cart.reduce((n, i) => n + i.qty, 0),
      cartSubtotal: () =>
        get().cart.reduce((sum, i) => sum + i.price * i.qty, 0),
      cartDiscount: () => {
        // discount already baked into item price; report promo discount instead
        return get().promoDiscount;
      },

      wishlist: [],
      toggleWishlist: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id)
            ? s.wishlist.filter((w) => w !== id)
            : [...s.wishlist, id],
        })),
      isWishlisted: (id) => get().wishlist.includes(id),

      promoCode: null,
      promoDiscount: 0,
      applyPromo: (code) => {
        const c = code.trim().toUpperCase();
        if (PROMOS[c]) {
          const sub = get().cartSubtotal();
          const off = Math.round(sub * PROMOS[c]);
          set({ promoCode: c, promoDiscount: off });
          return { ok: true, message: `کد تخفیف اعمال شد (${Math.round(PROMOS[c] * 100)}٪)` };
        }
        return { ok: false, message: "کد تخفیف نامعتبر است" };
      },
      clearPromo: () => set({ promoCode: null, promoDiscount: 0 }),

      isAuthed: false,
      phone: null,
      userName: "",
      login: (phone, name) =>
        set({ isAuthed: true, phone, userName: name || "کاربر لوکسا" }),
      logout: () => set({ isAuthed: false, phone: null, view: "home" }),

      addresses: [
        {
          id: "addr-1",
          recipient: "کاربر لوکسا",
          phone: "09120000000",
          province: "تهران",
          city: "تهران",
          postal: "1234567890",
          detail: "خیابان ولیعصر، نرسیده به پارک‌وی، پلاک ۱۲۰، واحد ۳",
        },
      ],
      addAddress: (a) =>
        set((s) => ({
          addresses: [...s.addresses, { ...a, id: `addr-${Date.now()}` }],
        })),
      removeAddress: (id) =>
        set((s) => ({ addresses: s.addresses.filter((x) => x.id !== id) })),

      orders: [
        {
          id: "LX-10234",
          date: "۱۴۰۳/۰۸/۱۲",
          status: "delivered",
          total: 4380000,
          items: [],
        },
        {
          id: "LX-10501",
          date: "۱۴۰۳/۰۹/۰۳",
          status: "shipped",
          total: 1890000,
          items: [],
        },
      ],
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
    }),
    {
      name: "luxa-store",
      partialize: (s) => ({
        cart: s.cart,
        wishlist: s.wishlist,
        isAuthed: s.isAuthed,
        phone: s.phone,
        userName: s.userName,
        addresses: s.addresses,
        orders: s.orders,
        promoCode: s.promoCode,
        promoDiscount: s.promoDiscount,
      }),
    },
  ),
);
