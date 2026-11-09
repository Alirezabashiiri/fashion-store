"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { getProductById, formatToman, toFaDigits } from "@/lib/data";
import { ProductCard } from "../ProductCard";
import {
  Package,
  MapPin,
  Heart,
  User as UserIcon,
  LogOut,
  Plus,
  Trash2,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Shield,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Tab = "orders" | "addresses" | "wishlist" | "profile";

export function DashboardView() {
  const isAuthed = useStore((s) => s.isAuthed);
  const authChecked = useStore((s) => s.authChecked);
  const userName = useStore((s) => s.userName);
  const phone = useStore((s) => s.phone);
  const isStaff = useStore((s) => s.isStaff);
  const setView = useStore((s) => s.setView);
  const logoutApi = useStore((s) => s.logoutApi);
  const [tab, setTab] = useState<Tab>("orders");

  if (!authChecked) {
    return (
      <div dir="rtl" className="mx-auto flex max-w-[1400px] items-center justify-center px-4 py-20">
        <Loader2 className="h-6 w-6 animate-spin text-ink-soft" />
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div dir="rtl" className="mx-auto max-w-[1400px] px-4 py-16">
        <div className="mx-auto max-w-md rounded-lg border border-border bg-white p-8 text-center">
          <UserIcon className="mx-auto mb-3 h-12 w-12 text-ink-soft/40" />
          <h2 className="text-lg font-bold text-ink">وارد نشده‌اید</h2>
          <p className="mt-1 text-sm text-ink-soft">برای مشاهده پنل کاربری وارد شوید</p>
          <button onClick={() => setView("auth")} className="mt-4 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white">
            ورود / ثبت‌نام
          </button>
        </div>
      </div>
    );
  }

  const tabs: { k: Tab; label: string; icon: typeof Package }[] = [
    { k: "orders", label: "سفارش‌های من", icon: Package },
    { k: "addresses", label: "آدرس‌ها", icon: MapPin },
    { k: "wishlist", label: "علاقه‌مندی‌ها", icon: Heart },
    { k: "profile", label: "اطلاعات حساب", icon: UserIcon },
  ];

  return (
    <div dir="rtl" className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-white font-bold text-lg">
            {userName.charAt(0)}
          </span>
          <div>
            <h1 className="text-base font-bold text-ink">{userName}</h1>
            <p className="text-xs text-ink-soft" dir="ltr">{phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isStaff && (
            <button
              onClick={() => setView("admin")}
              className="flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-xs font-medium text-white hover:bg-ink/90"
            >
              <Shield className="h-3.5 w-3.5" />
              پنل مدیریت
            </button>
          )}
          <button
            onClick={() => logoutApi()}
            className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-xs font-medium text-ink-soft hover:text-sale hover:border-sale"
          >
            <LogOut className="h-3.5 w-3.5" />
            خروج از حساب
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <nav className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-white p-2 lg:flex-col lg:overflow-visible">
            {tabs.map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  tab === t.k ? "bg-ink text-white" : "text-ink-soft hover:bg-surface-alt hover:text-ink"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <div>
          {tab === "orders" && <OrdersTab />}
          {tab === "addresses" && <AddressesTab />}
          {tab === "wishlist" && <WishlistTab />}
          {tab === "profile" && <ProfileTab />}
        </div>
      </div>
    </div>
  );
}

const STATUS_META: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "در انتظار پرداخت", icon: Clock, color: "text-amber-600 bg-amber-50" },
  paid: { label: "پرداخت‌شده", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  preparing: { label: "در حال آماده‌سازی", icon: Package, color: "text-sky-600 bg-sky-50" },
  shipped: { label: "ارسال شده", icon: Truck, color: "text-sky-600 bg-sky-50" },
  delivered: { label: "تحویل شده", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  cancelled: { label: "لغو شده", icon: XCircle, color: "text-sale bg-sale-soft" },
};

function OrdersTab() {
  const orders = useStore((s) => s.orders);
  const loadOrders = useStore((s) => s.loadOrders);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadOrders();
      setLoading(false);
    })();
  }, [loadOrders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-ink-soft" />
      </div>
    );
  }

  if (orders.length === 0) {
    return <EmptyState title="سفارشی ثبت نشده" desc="هنوز خریدی انجام نداده‌اید" cta="شروع خرید" />;
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const meta = STATUS_META[o.status] ?? STATUS_META.pending;
        const date = new Date(o.createdAt).toLocaleDateString("fa-IR");
        const items = o.items ?? [];
        return (
          <div key={o.id} className="rounded-lg border border-border bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.color}`}>
                  <meta.icon className="h-3.5 w-3.5" />
                  {meta.label}
                </span>
                <span className="text-xs text-ink-soft">تاریخ: {date}</span>
              </div>
              <span className="text-xs text-ink-soft" dir="ltr">#{o.code}</span>
            </div>

            {items.length > 0 ? (
              <div className="mt-3 space-y-2">
                {items.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <img src={it.image} alt="" className="h-12 w-12 rounded-md border border-border object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-ink">{it.name}</div>
                      <div className="text-[10px] text-ink-soft">{it.colorName} / {it.size} × {toFaDigits(it.qty)}</div>
                    </div>
                    <span className="font-medium text-ink">{toFaDigits(formatToman(it.price * it.qty))} ت</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-ink-soft">جزئیات اقلام در حال آماده‌سازی است.</p>
            )}

            {o.trackingCode && (
              <div className="mt-2 rounded bg-surface-alt px-3 py-1.5 text-[11px] text-ink-soft">
                کد رهگیری پستی: <span className="font-medium text-ink" dir="ltr">{o.trackingCode}</span>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <div className="text-sm">
                <span className="text-ink-soft">مبلغ کل: </span>
                <span className="font-bold text-ink">{toFaDigits(formatToman(o.total))} تومان</span>
              </div>
              <button
                onClick={() => toast({ title: "فاکتور آماده شد", description: `سفارش ${o.code}` })}
                className="rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-alt"
              >
                <CreditCard className="ml-1 inline h-3.5 w-3.5" />
                فاکتور
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AddressesTab() {
  const addresses = useStore((s) => s.addresses);
  const loadAddresses = useStore((s) => s.loadAddresses);
  const addAddressApi = useStore((s) => s.addAddressApi);
  const removeAddressApi = useStore((s) => s.removeAddressApi);
  const { toast } = useToast();
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ recipient: "", phone: "", province: "تهران", city: "تهران", postal: "", detail: "" });

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const save = async () => {
    if (!form.recipient || !form.phone || !form.postal || !form.detail) {
      toast({ title: "همه فیلدها را پر کنید" });
      return;
    }
    setSaving(true);
    const ok = await addAddressApi(form);
    setSaving(false);
    if (ok) {
      setForm({ recipient: "", phone: "", province: "تهران", city: "تهران", postal: "", detail: "" });
      setShow(false);
      toast({ title: "آدرس ذخیره شد" });
    } else {
      toast({ title: "خطا در ذخیره آدرس" });
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShow((v) => !v)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink bg-white py-3 text-sm font-medium text-ink hover:bg-surface-alt"
      >
        <Plus className="h-4 w-4" />
        افزودن آدرس جدید
      </button>

      {show && (
        <div className="space-y-3 rounded-lg border border-border bg-surface-alt p-4">
          <div className="grid grid-cols-2 gap-2">
            <input value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder="نام تحویل‌گیرنده" className="h-9 rounded-md border border-border bg-white px-3 text-xs focus:outline-none focus:border-ink" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="شماره تماس" dir="ltr" className="h-9 rounded-md border border-border bg-white px-3 text-xs focus:outline-none focus:border-ink" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="استان" className="h-9 rounded-md border border-border bg-white px-3 text-xs focus:outline-none focus:border-ink" />
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="شهر" className="h-9 rounded-md border border-border bg-white px-3 text-xs focus:outline-none focus:border-ink" />
          </div>
          <input value={form.postal} onChange={(e) => setForm({ ...form, postal: e.target.value })} placeholder="کد پستی" dir="ltr" className="h-9 w-full rounded-md border border-border bg-white px-3 text-xs focus:outline-none focus:border-ink" />
          <textarea value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} placeholder="آدرس کامل" rows={2} className="w-full rounded-md border border-border bg-white px-3 py-2 text-xs focus:outline-none focus:border-ink" />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="rounded-md bg-ink px-4 py-2 text-xs font-medium text-white disabled:opacity-60">{saving ? "در حال ذخیره..." : "ذخیره"}</button>
            <button onClick={() => setShow(false)} className="rounded-md border border-border bg-white px-4 py-2 text-xs text-ink-soft">انصراف</button>
          </div>
        </div>
      )}

      {addresses.map((a) => (
        <div key={a.id} className="rounded-lg border border-border bg-white p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-ink" />
              <div className="text-xs">
                <div className="font-bold text-ink">{a.recipient} — {toFaDigits(a.phone)}</div>
                <div className="mt-0.5 text-ink-soft">{a.province}، {a.city}، {a.detail}</div>
                <div className="mt-0.5 text-ink-soft/70">کد پستی: {toFaDigits(a.postal)}</div>
              </div>
            </div>
            <button onClick={() => removeAddressApi(a.id)} className="text-ink-soft hover:text-sale">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function WishlistTab() {
  const wishlist = useStore((s) => s.wishlist);
  if (wishlist.length === 0) {
    return <EmptyState title="علاقه‌مندی خالی است" desc="محصولات مورد علاقه خود را اینجا ذخیره کنید" cta="مشاهده محصولات" />;
  }
  const items = wishlist.map((id) => getProductById(id)).filter(Boolean);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((p) => p && <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

function ProfileTab() {
  const userName = useStore((s) => s.userName);
  const phone = useStore((s) => s.phone);
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: userName,
    phone: phone ?? "",
    nationalId: "",
    email: "",
  });

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <h2 className="mb-4 text-sm font-bold text-ink">اطلاعات حساب کاربری</h2>
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink">نام و نام خانوادگی</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm focus:outline-none focus:border-ink focus:bg-white" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink">شماره موبایل</label>
            <input value={form.phone} disabled dir="ltr" className="h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-ink-soft" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink">کد ملی</label>
            <input value={form.nationalId} onChange={(e) => setForm({ ...form, nationalId: e.target.value })} placeholder="جهت صدور فاکتور رسمی" dir="ltr" className="h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm focus:outline-none focus:border-ink focus:bg-white" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink">ایمیل</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="example@email.com" dir="ltr" className="h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm focus:outline-none focus:border-ink focus:bg-white" />
        </div>
        <button onClick={() => toast({ title: "اطلاعات ذخیره شد" })} className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white">
          ذخیره تغییرات
        </button>
      </div>
    </div>
  );
}

function EmptyState({ title, desc, cta }: { title: string; desc: string; cta: string }) {
  const setView = useStore((s) => s.setView);
  return (
    <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center">
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className="mt-1 text-xs text-ink-soft">{desc}</p>
      <button onClick={() => setView("home")} className="mt-3 rounded-md bg-ink px-4 py-2 text-xs font-medium text-white">
        {cta}
      </button>
    </div>
  );
}
