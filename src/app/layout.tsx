import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DentaLux — Стоматологическая клиника в Ташкенте",
  description: "Диагностика на 3D-томографе, терапия, ортодонтия и дентальная имплантация в Ташкенте. Фиксированный план лечения.",
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
    <html lang="ru" className={`${manrope.variable} h-full`}>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async></script>
      </head>
      <body className="min-h-full bg-[var(--bg)] text-[var(--ink)] font-sans antialiased selection:bg-[#0F5E5D] selection:text-white">
        {children}
      </body>
    </html>
  );
}
