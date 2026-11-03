import type { Metadata, Viewport } from "next";
import { Libre_Franklin, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const displayFont = Libre_Franklin({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Source_Serif_4({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DentaLux Tashkent — Цифровая Стоматология",
  description: "Швейцарская эстетическая стоматология и имплантология в Ташкенте. Брекеты, элайнеры, виниры, имплантация.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${displayFont.variable} ${bodyFont.variable} h-full`}>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body className="min-h-full bg-[#F6F4F0] text-[#1C1B1A] antialiased selection:bg-[#1B4332] selection:text-white">
        {children}
      </body>
    </html>
  );
}
