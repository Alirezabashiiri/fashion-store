"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { View } from "./data";
import { api } from "./api";

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
  isDefault?: boolean;
}

export interface OrderRecord {
  id: string;
  code: string;
  status: string;
  total: number;
  subtotal?: number;
  discount?: number;
  shipping?: number;
  trackingCode?: string | null;
  shippingMethod?: string | null;
  createdAt: string;
  items?: CartItem[];
}

export interface PaymentResult {
  status: "success" | "failed" | "cancelled";
  orderCode?: string;
  refId?: string;
  reason?: string;
}

interface AuthedUser {
  id: string;
  phone: string;
  fullName: string | null;
  isStaff: boolean;
}

interface AppState {
  // navigation
  view: View;
  activeProductId: string | null;
  plpSlug: string | null;
  plpTitle: string | null;
  adminTab: "dashboard" | "products" | "orders" | "discounts";

  setView: (v: View) => void;
  openProduct: (id: string) => void;
  openListing: (slug: string, title: string) => void;
  setAdminTab: (t: AppState["adminTab"]) => void;

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

  // promo (client-side preview; backend re-validates at checkout)
  promoCode: string | null;
  promoDiscount: number;
  applyPromo: (code: string) => { ok: boolean; message: string };
  clearPromo: () => void;

  // auth (API-backed)
  isAuthed: boolean;
  authChecked: boolean;
  phone: string | null;
  userName: string;
  isStaff: boolean;
  refreshAuth: () => Promise<void>;
  setAuthedUser: (u: AuthedUser) => void;
  logoutApi: () => Promise<void>;

  // addresses (loaded from API)
  addresses: Address[];
  loadAddresses: () => Promise<void>;
  addAddressApi: (a: Omit<Address, "id">) => Promise<boolean>;
  removeAddressApi: (id: string) => Promise<void>;

  // orders (loaded from API)
  orders: OrderRecord[];
  loadOrders: () => Promise<void>;

  // payment result (from ?payment= callback)
  paymentResult: PaymentResult | null;
  setPaymentResult: (r: PaymentResult | null) => void;
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
      adminTab: "dashboard",

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
      setAdminTab: (t) => set({ adminTab: t }),

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
          if (qty <= 0) return { cart: s.cart.filter((_, i) => i !== index) };
          const next = [...s.cart];
          next[index] = { ...next[index], qty };
          return { cart: next };
        }),
      removeFromCart: (index) =>
        set((s) => ({ cart: s.cart.filter((_, i) => i !== index) })),
      clearCart: () => set({ cart: [], promoCode: null, promoDiscount: 0 }),
      cartCount: () => get().cart.reduce((n, i) => n + i.qty, 0),
      cartSubtotal: () => get().cart.reduce((sum, i) => sum + i.price * i.qty, 0),
      cartDiscount: () => get().promoDiscount,

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
          return { ok: true, message: `کد تخفیف اعمال شد (${Math.round(PROMOS[c] * 100)}٪) — در زمان پرداخت نهایی اعتبارسنجی می‌شود` };
        }
        return { ok: false, message: "کد تخفیف نامعتبر است" };
      },
      clearPromo: () => set({ promoCode: null, promoDiscount: 0 }),

      // auth
      isAuthed: false,
      authChecked: false,
      phone: null,
      userName: "",
      isStaff: false,
      refreshAuth: async () => {
        try {
          const data = await api.me();
          const u = data.user;
          set({
            isAuthed: true,
            authChecked: true,
            phone: u.phone,
            userName: u.fullName || "کاربر لوکسا",
            isStaff: u.isStaff,
          });
        } catch {
          set({ isAuthed: false, authChecked: true, phone: null, userName: "", isStaff: false });
        }
      },
      setAuthedUser: (u) =>
        set({
          isAuthed: true,
          authChecked: true,
          phone: u.phone,
          userName: u.fullName || "کاربر لوکسا",
          isStaff: u.isStaff,
        }),
      logoutApi: async () => {
        try {
          await api.logout();
        } catch {
          /* ignore */
        }
        set({ isAuthed: false, authChecked: true, phone: null, userName: "", isStaff: false, view: "home" });
      },

      // addresses
      addresses: [],
      loadAddresses: async () => {
        try {
          const data = await api.listAddresses();
          set({ addresses: data.addresses });
        } catch {
          /* not authed */
        }
      },
      addAddressApi: async (a) => {
        try {
          const data = await api.addAddress(a);
          set((s) => ({ addresses: [data.address, ...s.addresses] }));
          return true;
        } catch {
          return false;
        }
      },
      removeAddressApi: async (id) => {
        try {
          await api.deleteAddress(id);
          set((s) => ({ addresses: s.addresses.filter((x) => x.id !== id) }));
        } catch {
          /* ignore */
        }
      },

      // orders
      orders: [],
      loadOrders: async () => {
        try {
          const data = await api.listOrders();
          set({ orders: data.orders });
        } catch {
          /* not authed */
        }
      },

      // payment result
      paymentResult: null,
      setPaymentResult: (r) => set({ paymentResult: r }),
    }),
    {
      name: "luxa-store",
      partialize: (s) => ({
        cart: s.cart,
        wishlist: s.wishlist,
        isAuthed: s.isAuthed,
        phone: s.phone,
        userName: s.userName,
        isStaff: s.isStaff,
        promoCode: s.promoCode,
        promoDiscount: s.promoDiscount,
      }),
    },
  ),
);
