"use client";

// Thin fetch wrapper.
// Same-origin requests include the HttpOnly auth cookie automatically.
// Set NEXT_PUBLIC_API_BASE_URL to point to an external backend (e.g. Django).
//   empty  → use built-in Next.js API routes (default)
//   http://localhost:8000 → use the Django backend in /backend

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function buildUrl(url: string): string {
  // Only prefix API calls; never rewrite absolute URLs (e.g. payment redirects).
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return API_BASE ? `${API_BASE}${url}` : url;
}

export async function apiFetch<T = any>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(buildUrl(url), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    credentials: "include",
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.error ?? `خطای ${res.status}`;
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}

export const api = {
  // accounts
  otpRequest: (phone: string) =>
    apiFetch("/api/accounts/otp/request", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),
  otpVerify: (phone: string, code: string) =>
    apiFetch("/api/accounts/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    }),
  me: () => apiFetch("/api/accounts/me"),
  logout: () => apiFetch("/api/accounts/logout", { method: "POST" }),
  listAddresses: () => apiFetch("/api/accounts/addresses"),
  addAddress: (data: any) =>
    apiFetch("/api/accounts/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteAddress: (id: string) =>
    apiFetch(`/api/accounts/addresses/${id}`, { method: "DELETE" }),

  // products
  products: (params: Record<string, string | string[] | undefined>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === "") continue;
      if (Array.isArray(v)) v.forEach((x) => sp.append(k, x));
      else sp.append(k, String(v));
    }
    return apiFetch(`/api/products?${sp.toString()}`);
  },
  product: (id: string) => apiFetch(`/api/products/${id}`),
  categories: () => apiFetch("/api/categories"),
  brands: () => apiFetch("/api/brands"),

  // orders + payments
  createOrder: (data: any) =>
    apiFetch("/api/orders", { method: "POST", body: JSON.stringify(data) }),
  listOrders: () => apiFetch("/api/orders"),
  requestPayment: (orderId: string) =>
    apiFetch("/api/payments/request", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    }),

  // admin
  adminStats: () => apiFetch("/api/admin/stats"),
  adminProducts: (q?: string, page = 1) => {
    const sp = new URLSearchParams({ page: String(page), pageSize: "50" });
    if (q) sp.set("q", q);
    return apiFetch(`/api/admin/products?${sp.toString()}`);
  },
  adminProduct: (id: string) => apiFetch(`/api/admin/products/${id}`),
  adminCreateProduct: (data: any) =>
    apiFetch("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  adminUpdateProduct: (id: string, data: any) =>
    apiFetch(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  adminDeleteProduct: (id: string) =>
    apiFetch(`/api/admin/products/${id}`, { method: "DELETE" }),
  adminOrders: (status?: string, page = 1) => {
    const sp = new URLSearchParams({ page: String(page), pageSize: "50" });
    if (status) sp.set("status", status);
    return apiFetch(`/api/admin/orders?${sp.toString()}`);
  },
  adminOrder: (id: string) => apiFetch(`/api/admin/orders/${id}`),
  adminBulkOrderStatus: (ids: string[], status: string, trackingCode?: string) =>
    apiFetch("/api/admin/orders", {
      method: "PATCH",
      body: JSON.stringify({ ids, status, trackingCode }),
    }),
  adminUpdateOrder: (id: string, data: any) =>
    apiFetch(`/api/admin/orders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  adminDiscounts: () => apiFetch("/api/admin/discounts"),
  adminCreateDiscount: (data: any) =>
    apiFetch("/api/admin/discounts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  adminDeleteDiscount: (id: string) =>
    apiFetch(`/api/admin/discounts/${id}`, { method: "DELETE" }),
};
