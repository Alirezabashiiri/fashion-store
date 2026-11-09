"use client";

import { useEffect } from "react";
import { useStore, type View } from "@/lib/store";
import { TopBar } from "@/components/store/TopBar";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { HomeView } from "@/components/store/views/HomeView";
import { ProductListingView } from "@/components/store/views/ProductListingView";
import { ProductDetailView } from "@/components/store/views/ProductDetailView";
import { CartView } from "@/components/store/views/CartView";
import { CheckoutView } from "@/components/store/views/CheckoutView";
import { AuthView } from "@/components/store/views/AuthView";
import { DashboardView } from "@/components/store/views/DashboardView";
import { AdminView } from "@/components/store/views/AdminView";
import { PaymentResultView } from "@/components/store/views/PaymentResultView";

export default function Home() {
  const view = useStore((s) => s.view);
  const refreshAuth = useStore((s) => s.refreshAuth);
  const setPaymentResult = useStore((s) => s.setPaymentResult);
  const setView = useStore((s) => s.setView);

  // On mount: restore auth session from HttpOnly cookie + handle payment callback.
  useEffect(() => {
    refreshAuth();

    // Parse ?payment= callback from Shaparak verify redirect.
    const url = new URL(window.location.href);
    const payment = url.searchParams.get("payment");
    if (payment) {
      setPaymentResult({
        status: payment as "success" | "failed" | "cancelled",
        orderCode: url.searchParams.get("order") ?? undefined,
        refId: url.searchParams.get("ref") ?? undefined,
        reason: url.searchParams.get("reason") ?? undefined,
      });
      setView("payment-result");
      // Clean the URL so a refresh doesn't re-trigger.
      window.history.replaceState({}, "", "/");
    }
  }, [refreshAuth, setPaymentResult, setView]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      <Header />
      <main className="flex-1">{renderView(view)}</main>
      <Footer />
    </div>
  );
}

function renderView(view: View) {
  switch (view) {
    case "home":
      return <HomeView />;
    case "plp":
      return <ProductListingView />;
    case "pdp":
      return <ProductDetailView />;
    case "cart":
      return <CartView />;
    case "checkout":
      return <CheckoutView />;
    case "auth":
      return <AuthView />;
    case "dashboard":
      return <DashboardView />;
    case "admin":
      return <AdminView />;
    case "payment-result":
      return <PaymentResultView />;
    default:
      return <HomeView />;
  }
}
