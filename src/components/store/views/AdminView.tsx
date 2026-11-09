"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { api, ApiError } from "@/lib/api";
import { formatToman, toFaDigits } from "@/lib/data";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Ticket,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
  Loader2,
  Shield,
  TrendingUp,
  AlertTriangle,
  Users,
  Printer,
  Search,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminView() {
  const isAuthed = useStore((s) => s.isAuthed);
  const authChecked = useStore((s) => s.authChecked);
  const isStaff = useStore((s) => s.isStaff);
  const setView = useStore((s) => s.setView);
  const tab = useStore((s) => s.adminTab);
  const setAdminTab = useStore((s) => s.setAdminTab);

  if (!authChecked) {
    return (
      <div dir="rtl" className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-ink-soft" />
      </div>
    );
  }

  if (!isAuthed || !isStaff) {
    return (
      <div dir="rtl" className="mx-auto max-w-[1400px] px-4 py-16">
        <div className="mx-auto max-w-md rounded-lg border border-border bg-white p-8 text-center">
          <Shield className="mx-auto mb-3 h-12 w-12 text-ink-soft/40" />
          <h2 className="text-lg font-bold text-ink">دسترسی محدود به مدیران</h2>
          <p className="mt-1 text-sm text-ink-soft">برای ورود به پنل مدیریت با حساب مدیر وارد شوید</p>
          <p className="mt-2 text-xs text-ink-soft/70">برای تست: شماره ۰۹۰۰۰۰۰۰۰۰۰۰</p>
          <button onClick={() => setView("auth")} className="mt-4 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white">
            ورود مدیر
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { k: "dashboard" as const, label: "داشبورد", icon: LayoutDashboard },
    { k: "products" as const, label: "محصولات و انبار", icon: Package },
    { k: "orders" as const, label: "سفارش‌ها", icon: ShoppingCart },
    { k: "discounts" as const, label: "کدهای تخفیف", icon: Ticket },
  ];

  return (
    <div dir="rtl" className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-base font-bold text-ink">پنل مدیریت لوکسا</h1>
            <p className="text-xs text-ink-soft">مدیریت محصولات، سفارش‌ها، انبار و کمپین‌ها</p>
          </div>
        </div>
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-xs font-medium text-ink-soft hover:text-ink"
        >
          بازگشت به فروشگاه
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-lg border border-border bg-white p-2">
        {tabs.map((t) => (
          <button
            key={t.k}
            onClick={() => setAdminTab(t.k)}
            className={`flex shrink-0 items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${
              tab === t.k ? "bg-ink text-white" : "text-ink-soft hover:bg-surface-alt hover:text-ink"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <AdminDashboard />}
      {tab === "products" && <AdminProducts />}
      {tab === "orders" && <AdminOrders />}
      {tab === "discounts" && <AdminDiscounts />}
    </div>
  );
}

// ───────────────────────── Dashboard ─────────────────────────
function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.adminStats();
        setStats(data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !stats) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-ink-soft" /></div>;
  }

  const cards = [
    { label: "درآمد کل (تاییدشده)", value: `${toFaDigits(formatToman(stats.revenue))} ت`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    { label: "تعداد سفارش‌ها", value: toFaDigits(stats.totalOrders), icon: ShoppingCart, color: "text-sky-600 bg-sky-50" },
    { label: "محصولات", value: toFaDigits(stats.totalProducts), icon: Package, color: "text-ink bg-surface-alt" },
    { label: "کاربران", value: toFaDigits(stats.totalUsers), icon: Users, color: "text-purple-600 bg-purple-50" },
    { label: "سفارش‌های پرداخت‌شده", value: toFaDigits(stats.paidOrders), icon: Check, color: "text-emerald-600 bg-emerald-50" },
    { label: "در انتظار پرداخت", value: toFaDigits(stats.pendingOrders), icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
    { label: "متغیرهای کم‌موجودی", value: toFaDigits(stats.lowStockVariants), icon: AlertTriangle, color: "text-sale bg-sale-soft" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-white p-4">
            <div className={`mb-2 grid h-9 w-9 place-items-center rounded-md ${c.color}`}>
              <c.icon className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold text-ink">{c.value}</div>
            <div className="text-[11px] text-ink-soft">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-ink">آخرین سفارش‌ها</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="border-b border-border text-ink-soft">
              <tr>
                <th className="py-2 pr-2">کد</th>
                <th className="py-2">مشتری</th>
                <th className="py-2">تعداد اقلام</th>
                <th className="py-2">مبلغ</th>
                <th className="py-2">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o: any) => (
                <tr key={o.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-2 font-bold text-ink" dir="ltr">{o.code}</td>
                  <td className="py-2.5 text-ink-soft">{o.user}</td>
                  <td className="py-2.5 text-ink-soft">{toFaDigits(o.itemCount)}</td>
                  <td className="py-2.5 font-medium text-ink">{toFaDigits(formatToman(o.total))} ت</td>
                  <td className="py-2.5"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Products ─────────────────────────
function AdminProducts() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null); // null=list, "new"=create, object=edit
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.adminProducts(q);
      setItems(data.items);
    } catch {
      toast({ title: "خطا در بارگذاری" });
    } finally {
      setLoading(false);
    }
  }, [q, toast]);

  useEffect(() => {
    Promise.all([api.brands(), api.categories()]).then(([b, c]) => {
      setBrands(b.brands);
      setCategories(c.categories);
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  if (editing) {
    return (
      <ProductEditor
        product={editing === "new" ? null : editing}
        brands={brands}
        categories={categories}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); load(); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو بر اساس نام یا کد کالا..."
            className="h-10 w-full rounded-md border border-border bg-white pr-9 pl-3 text-sm focus:outline-none focus:border-ink"
          />
        </div>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-ink/90"
        >
          <Plus className="h-4 w-4" />
          محصول جدید
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-ink-soft" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-right text-xs">
            <thead className="border-b border-border bg-surface-alt text-ink-soft">
              <tr>
                <th className="py-2.5 pr-3">تصویر</th>
                <th className="py-2.5">نام / کد</th>
                <th className="py-2.5">دسته / برند</th>
                <th className="py-2.5">قیمت</th>
                <th className="py-2.5">موجودی</th>
                <th className="py-2.5">متغیرها</th>
                <th className="py-2.5">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-border/60 hover:bg-surface-alt/50">
                  <td className="py-2 pr-3"><img src={p.image} alt="" className="h-12 w-12 rounded-md border border-border object-cover" /></td>
                  <td className="py-2">
                    <div className="font-medium text-ink">{p.name}</div>
                    <div className="text-[10px] text-ink-soft" dir="ltr">{p.sku}</div>
                  </td>
                  <td className="py-2 text-ink-soft">{p.category ?? "—"}<br /><span className="text-[10px]">{p.brand ?? "—"}</span></td>
                  <td className="py-2 font-medium text-ink">{toFaDigits(formatToman(p.price))} ت{p.oldPrice && <div className="text-[10px] text-ink-soft line-through">{toFaDigits(formatToman(p.oldPrice))}</div>}</td>
                  <td className="py-2">
                    <span className={p.lowStock ? "font-bold text-sale" : "text-ink"}>{toFaDigits(p.totalStock)}</span>
                    {p.lowStock && <div className="text-[10px] text-sale">کم‌موجودی</div>}
                  </td>
                  <td className="py-2 text-ink-soft">{toFaDigits(p.variantCount)}</td>
                  <td className="py-2">
                    <div className="flex gap-1">
                      <button onClick={() => setEditing(p)} className="grid h-7 w-7 place-items-center rounded text-ink hover:bg-surface-alt"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button
                        onClick={async () => {
                          if (!confirm(`حذف «${p.name}»؟`)) return;
                          try {
                            await api.adminDeleteProduct(p.id);
                            toast({ title: "محصول حذف شد" });
                            load();
                          } catch { toast({ title: "خطا در حذف" }); }
                        }}
                        className="grid h-7 w-7 place-items-center rounded text-ink-soft hover:text-sale"
                      ><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Product editor with variant TabularInline (add/remove color×size rows with stock).
function ProductEditor({ product, brands, categories, onClose, onSaved }: {
  product: any | null;
  brands: any[];
  categories: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const isNew = !product;
  const [form, setForm] = useState({
    name: product?.name ?? "",
    nameEn: product?.nameEn ?? "",
    sku: product?.sku ?? "",
    brandId: product?.brandId ?? "",
    categoryId: product?.categoryId ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    oldPrice: product?.oldPrice?.toString() ?? "",
    image: product?.image ?? "/images/cat-coat.png",
    hoverImage: product?.hoverImage ?? "/images/cat-coat.png",
    isNew: product?.isNew ?? false,
    isBestseller: product?.isBestseller ?? false,
    isSpecial: product?.isSpecial ?? false,
    isActive: product?.isActive ?? true,
  });
  const [variants, setVariants] = useState<any[]>(
    product?.variants ?? [{ colorName: "مشکی", colorHex: "#1a1a1a", size: "M", stock: 10, price: null }],
  );
  const [saving, setSaving] = useState(false);

  const addVariant = () => setVariants([...variants, { colorName: "مشکی", colorHex: "#1a1a1a", size: "M", stock: 0, price: null }]);
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: string, value: any) => {
    const next = [...variants];
    next[i] = { ...next[i], [field]: value };
    setVariants(next);
  };

  const save = async () => {
    if (!form.name || !form.sku || !form.price) {
      toast({ title: "نام، کد کالا و قیمت الزامی است" });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, price: parseInt(form.price), oldPrice: form.oldPrice ? parseInt(form.oldPrice) : null, variants };
      if (isNew) {
        await api.adminCreateProduct(payload);
        toast({ title: "محصول ایجاد شد" });
      } else {
        await api.adminUpdateProduct(product.id, payload);
        toast({ title: "محصول بروزرسانی شد" });
      }
      onSaved();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "خطا در ذخیره";
      toast({ title: msg });
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-white p-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-sm font-bold text-ink">{isNew ? "ایجاد محصول جدید" : "ویرایش محصول"}</h3>
        <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded text-ink-soft hover:bg-surface-alt"><X className="h-4 w-4" /></button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="نام محصول"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} /></Field>
        <Field label="نام انگلیسی"><input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className={inputCls} dir="ltr" /></Field>
        <Field label="کد کالا (SKU)"><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputCls} dir="ltr" /></Field>
        <Field label="برند">
          <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} className={inputCls}>
            <option value="">— انتخاب —</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <Field label="دسته‌بندی">
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls}>
            <option value="">— انتخاب —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            {categories.flatMap((c) => c.children?.map((ch: any) => <option key={ch.id} value={ch.id}>{c.title} / {ch.title}</option>) ?? [])}
          </select>
        </Field>
        <Field label="تصویر اصلی (مسیر)"><input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputCls} dir="ltr" /></Field>
        <Field label="قیمت (تومان)"><input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} dir="ltr" inputMode="numeric" /></Field>
        <Field label="قیمت قبل تخفیف (اختیاری)"><input value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} className={inputCls} dir="ltr" inputMode="numeric" /></Field>
      </div>

      <Field label="توضیحات"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls} /></Field>

      <div className="flex flex-wrap gap-4">
        {[
          { k: "isNew", l: "جدید" }, { k: "isBestseller", l: "پرفروش" }, { k: "isSpecial", l: "شگفت‌انگیز" }, { k: "isActive", l: "فعال" },
        ].map((f) => (
          <label key={f.k} className="flex items-center gap-1.5 text-xs text-ink-soft">
            <input type="checkbox" checked={(form as any)[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.checked })} className="accent-ink" />
            {f.l}
          </label>
        ))}
      </div>

      {/* Variants inline (TabularInline equivalent) */}
      <div className="rounded-md border border-border">
        <div className="flex items-center justify-between border-b border-border bg-surface-alt px-3 py-2">
          <span className="text-xs font-bold text-ink">متغیرهای محصول (رنگ / سایز / موجودی)</span>
          <button onClick={addVariant} className="flex items-center gap-1 text-xs font-medium text-ink hover:text-ink/70"><Plus className="h-3.5 w-3.5" />افزودن ردیف</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-ink-soft">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-right">رنگ (نام)</th>
                <th className="py-2 text-right">هکس رنگ</th>
                <th className="py-2 text-right">سایز</th>
                <th className="py-2 text-right">موجودی</th>
                <th className="py-2 text-right">قیمت اختصاصی</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="py-1.5 pr-3"><input value={v.colorName} onChange={(e) => updateVariant(i, "colorName", e.target.value)} className={inputCls} /></td>
                  <td className="py-1.5"><input value={v.colorHex} onChange={(e) => updateVariant(i, "colorHex", e.target.value)} className={`${inputCls} dir-ltr`} dir="ltr" /></td>
                  <td className="py-1.5"><input value={v.size} onChange={(e) => updateVariant(i, "size", e.target.value)} className={inputCls} /></td>
                  <td className="py-1.5"><input value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} className={inputCls} dir="ltr" inputMode="numeric" /></td>
                  <td className="py-1.5"><input value={v.price ?? ""} onChange={(e) => updateVariant(i, "price", e.target.value || null)} className={inputCls} dir="ltr" inputMode="numeric" placeholder="— پیش‌فرض" /></td>
                  <td className="py-1.5"><button onClick={() => removeVariant(i)} className="text-ink-soft hover:text-sale"><Trash2 className="h-3.5 w-3.5" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={save} disabled={saving} className="flex items-center gap-1.5 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {isNew ? "ایجاد محصول" : "ذخیره تغییرات"}
        </button>
        <button onClick={onClose} className="rounded-md border border-border bg-white px-5 py-2.5 text-sm font-medium text-ink-soft">انصراف</button>
      </div>
    </div>
  );
}

// ───────────────────────── Orders ─────────────────────────
function AdminOrders() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("shipped");
  const [trackingCode, setTrackingCode] = useState("");
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.adminOrders(statusFilter);
      setItems(data.items);
      setSelected([]);
    } catch {
      toast({ title: "خطا در بارگذاری" });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => { load(); }, [load]);

  const toggleSel = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const bulkUpdate = async () => {
    if (selected.length === 0) return;
    try {
      const res = await api.adminBulkOrderStatus(selected, bulkStatus, trackingCode || undefined);
      toast({ title: `${toFaDigits(res.updated)} سفارش بروزرسانی شد` });
      setTrackingCode("");
      load();
    } catch {
      toast({ title: "خطا در بروزرسانی" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters + bulk actions */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-white p-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-border bg-white px-2 text-xs focus:outline-none focus:border-ink">
          <option value="">همه وضعیت‌ها</option>
          <option value="pending">در انتظار پرداخت</option>
          <option value="paid">پرداخت‌شده</option>
          <option value="preparing">در حال آماده‌سازی</option>
          <option value="shipped">ارسال شده</option>
          <option value="delivered">تحویل شده</option>
          <option value="cancelled">لغو شده</option>
        </select>

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-md bg-surface-alt px-3 py-1.5">
            <span className="text-xs font-medium text-ink">{toFaDigits(selected.length)} انتخاب شده</span>
            <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="h-8 rounded border border-border bg-white px-2 text-xs">
              <option value="preparing">آماده‌سازی</option>
              <option value="shipped">ارسال شده</option>
              <option value="delivered">تحویل شده</option>
              <option value="cancelled">لغو</option>
            </select>
            <input value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} placeholder="کد رهگیری (اختیاری)" className="h-8 w-40 rounded border border-border bg-white px-2 text-xs" dir="ltr" />
            <button onClick={bulkUpdate} className="rounded bg-ink px-3 py-1.5 text-xs font-medium text-white">اعمال دسته‌جمعی</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-ink-soft" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center text-sm text-ink-soft">سفارشی یافت نشد</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-right text-xs">
            <thead className="border-b border-border bg-surface-alt text-ink-soft">
              <tr>
                <th className="py-2.5 pr-3"><input type="checkbox" className="accent-ink" checked={selected.length === items.length && items.length > 0} onChange={(e) => setSelected(e.target.checked ? items.map((i) => i.id) : [])} /></th>
                <th className="py-2.5">کد</th>
                <th className="py-2.5">مشتری</th>
                <th className="py-2.5">مبلغ</th>
                <th className="py-2.5">وضعیت</th>
                <th className="py-2.5">رهگیری</th>
                <th className="py-2.5">تاریخ</th>
                <th className="py-2.5">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id} className="border-b border-border/60 hover:bg-surface-alt/50">
                  <td className="py-2 pr-3"><input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggleSel(o.id)} className="accent-ink" /></td>
                  <td className="py-2 font-bold text-ink" dir="ltr">{o.code}</td>
                  <td className="py-2 text-ink-soft">{o.user.fullName ?? o.user.phone}</td>
                  <td className="py-2 font-medium text-ink">{toFaDigits(formatToman(o.total))} ت</td>
                  <td className="py-2"><StatusBadge status={o.status} label={o.statusLabel} /></td>
                  <td className="py-2 text-ink-soft" dir="ltr">{o.trackingCode ?? "—"}</td>
                  <td className="py-2 text-ink-soft">{new Date(o.createdAt).toLocaleDateString("fa-IR")}</td>
                  <td className="py-2">
                    <button onClick={async () => {
                      try { const d = await api.adminOrder(o.id); setInvoiceOrder(d.order); } catch { toast({ title: "خطا" }); }
                    }} className="flex items-center gap-1 text-ink hover:text-ink/70"><Printer className="h-3.5 w-3.5" /> فاکتور</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label?: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    preparing: "bg-sky-50 text-sky-700 border-sky-200",
    shipped: "bg-sky-50 text-sky-700 border-sky-200",
    delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-sale-soft text-sale border-sale/20",
  };
  const labels: Record<string, string> = {
    pending: "در انتظار پرداخت", paid: "پرداخت‌شده", preparing: "آماده‌سازی",
    shipped: "ارسال شده", delivered: "تحویل شده", cancelled: "لغو شده",
  };
  return (
    <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${map[status] ?? ""}`}>
      {label ?? labels[status] ?? status}
    </span>
  );
}

function InvoiceModal({ order, onClose }: { order: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 scrollbar-thin" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-ink">فاکتور رسمی خرید</h3>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-1 rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-white"><Printer className="h-3.5 w-3.5" />چاپ</button>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded text-ink-soft hover:bg-surface-alt"><X className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="mb-1 font-bold text-ink">فروشنده:</div>
            <div className="text-ink-soft">فروشگاه آنلاین لوکسا</div>
            <div className="text-ink-soft">نماد اعتماد الکترونیکی</div>
          </div>
          <div>
            <div className="mb-1 font-bold text-ink">خریدار:</div>
            <div className="text-ink-soft">{order.user.fullName}</div>
            <div className="text-ink-soft" dir="ltr">{order.user.phone}</div>
            {order.user.nationalId && <div className="text-ink-soft" dir="ltr">کد ملی: {order.user.nationalId}</div>}
          </div>
        </div>

        <div className="mt-3 rounded bg-surface-alt p-3 text-xs">
          <div className="text-ink-soft">آدرس ارسال:</div>
          <div className="text-ink">{order.address ? `${order.address.province}، ${order.address.city}، ${order.address.detail} — کد پستی: ${order.address.postal}` : "—"}</div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="border-b border-border text-ink-soft">
              <tr>
                <th className="py-2">کالا</th>
                <th className="py-2">رنگ/سایز</th>
                <th className="py-2">تعداد</th>
                <th className="py-2">قیمت واحد</th>
                <th className="py-2">مبلغ</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it: any) => (
                <tr key={it.id} className="border-b border-border/60">
                  <td className="py-2 text-ink">{it.name}</td>
                  <td className="py-2 text-ink-soft">{it.colorName} / {it.size}</td>
                  <td className="py-2 text-ink-soft">{toFaDigits(it.qty)}</td>
                  <td className="py-2 text-ink-soft">{toFaDigits(formatToman(it.unitPrice))} ت</td>
                  <td className="py-2 font-medium text-ink">{toFaDigits(formatToman(it.lineTotal))} ت</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 space-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-ink-soft">مجموع کالاها</span><span className="text-ink">{toFaDigits(formatToman(order.subtotal))} ت</span></div>
          {order.discount > 0 && <div className="flex justify-between text-sale"><span>تخفیف</span><span>− {toFaDigits(formatToman(order.discount))} ت</span></div>}
          <div className="flex justify-between"><span className="text-ink-soft">ارسال</span><span className="text-ink">{order.shipping === 0 ? "رایگان" : `${toFaDigits(formatToman(order.shipping))} ت`}</span></div>
          <div className="flex justify-between border-t border-border pt-1.5 text-sm font-bold"><span className="text-ink">مبلغ نهایی</span><span className="text-ink">{toFaDigits(formatToman(order.total))} تومان</span></div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-ink-soft">
          <div>شماره سفارش: <span className="font-bold text-ink" dir="ltr">{order.code}</span></div>
          <div>تاریخ: {new Date(order.createdAt).toLocaleDateString("fa-IR")}</div>
          {order.transaction?.refId && <div>کد پیگیری بانک: <span className="font-bold text-ink" dir="ltr">{order.transaction.refId}</span></div>}
          <div>وضعیت: <StatusBadge status={order.status} /></div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────── Discounts ─────────────────────────
function AdminDiscounts() {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", maxUses: "", expiresAt: "", minSubtotal: "", isActive: true });

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.adminDiscounts();
      setItems(data.items);
    } catch {
      toast({ title: "خطا" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.code || !form.value) { toast({ title: "کد و مقدار الزامی است" }); return; }
    try {
      await api.adminCreateDiscount({
        code: form.code, type: form.type, value: form.value,
        maxUses: form.maxUses || 0, expiresAt: form.expiresAt || null,
        minSubtotal: form.minSubtotal || 0, isActive: form.isActive,
      });
      toast({ title: "کد تخفیف ایجاد شد" });
      setForm({ code: "", type: "percent", value: "", maxUses: "", expiresAt: "", minSubtotal: "", isActive: true });
      setShow(false);
      load();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "خطا";
      toast({ title: msg });
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={() => setShow((v) => !v)} className="flex items-center gap-1.5 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white">
        <Plus className="h-4 w-4" />کد تخفیف جدید
      </button>

      {show && (
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface-alt p-4 sm:grid-cols-3">
          <Field label="کد"><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={inputCls} dir="ltr" /></Field>
          <Field label="نوع">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputCls}>
              <option value="percent">درصدی</option>
              <option value="fixed">مبلغ ثابت</option>
            </select>
          </Field>
          <Field label="مقدار (٪ یا تومان)"><input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className={inputCls} dir="ltr" inputMode="numeric" /></Field>
          <Field label="حداکثر استفاده (۰=نامحدود)"><input value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className={inputCls} dir="ltr" inputMode="numeric" /></Field>
          <Field label="حداقل خرید (تومان)"><input value={form.minSubtotal} onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })} className={inputCls} dir="ltr" inputMode="numeric" /></Field>
          <Field label="تاریخ انقضا"><input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className={inputCls} dir="ltr" /></Field>
          <div className="col-span-2 sm:col-span-3 flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-ink-soft"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-ink" />فعال</label>
            <button onClick={save} className="rounded-md bg-ink px-4 py-2 text-xs font-medium text-white">ذخیره</button>
            <button onClick={() => setShow(false)} className="rounded-md border border-border bg-white px-4 py-2 text-xs text-ink-soft">انصراف</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-ink-soft" /></div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-right text-xs">
            <thead className="border-b border-border bg-surface-alt text-ink-soft">
              <tr>
                <th className="py-2.5 pr-3">کد</th>
                <th className="py-2.5">نوع</th>
                <th className="py-2.5">مقدار</th>
                <th className="py-2.5">استفاده</th>
                <th className="py-2.5">حداقل خرید</th>
                <th className="py-2.5">وضعیت</th>
                <th className="py-2.5">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="py-2 pr-3 font-bold text-ink" dir="ltr">{c.code}</td>
                  <td className="py-2 text-ink-soft">{c.type === "percent" ? "درصدی" : "مبلغ ثابت"}</td>
                  <td className="py-2 font-medium text-ink">{c.type === "percent" ? `${toFaDigits(c.value)}٪` : `${toFaDigits(formatToman(c.value))} ت`}</td>
                  <td className="py-2 text-ink-soft">{toFaDigits(c.uses)}{c.maxUses > 0 ? ` / ${toFaDigits(c.maxUses)}` : " / ∞"}</td>
                  <td className="py-2 text-ink-soft">{c.minSubtotal ? `${toFaDigits(formatToman(c.minSubtotal))} ت` : "—"}</td>
                  <td className="py-2">{c.isActive ? <span className="text-emerald-600">فعال</span> : <span className="text-ink-soft">غیرفعال</span>}</td>
                  <td className="py-2">
                    <button onClick={async () => { try { await api.adminDeleteDiscount(c.id); toast({ title: "حذف شد" }); load(); } catch { toast({ title: "خطا" }); } }} className="text-ink-soft hover:text-sale"><Trash2 className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// helpers
const inputCls = "h-9 w-full rounded-md border border-border bg-white px-2.5 text-xs focus:outline-none focus:border-ink";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-ink-soft">{label}</label>
      {children}
    </div>
  );
}
