import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "لوکسا | فروشگاه آنلاین پوشاک، کیف، کفش و اکسسوری",
  description:
    "مرجع خرید آنلاین پوشاک زنانه، مردانه و بچه‌گانه، کیف، کفش و اکسسوری اصل با ضمانت اصالت کالا، ارسال سریع و ۷ روز ضمانت بازگشت.",
  keywords: [
    "فروشگاه آنلاین پوشاک",
    "خرید لباس",
    "کیف",
    "کفش",
    "اکسسوری",
    "مد و فشن",
  ],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
