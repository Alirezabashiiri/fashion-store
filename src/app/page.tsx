"use client";

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

export default function Home() {
  const view = useStore((s) => s.view);

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
    default:
      return <HomeView />;
  }
}
