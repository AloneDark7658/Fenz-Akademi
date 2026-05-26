import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Fenz Akademi — Yeni Nesil Eğitim Platformu",
    template: "%s | Fenz Akademi",
  },
  description:
    "Ortaokul öğrencileri için video eğitimler, interaktif testler ve oyunlaştırma ile öğrenmeyi eğlenceli hale getiren eğitim platformu.",
  keywords: [
    "eğitim",
    "ortaokul",
    "video ders",
    "online eğitim",
    "matematik",
    "fen bilimleri",
    "gamification",
  ],
  authors: [{ name: "Fenz Akademi" }],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Fenz Akademi",
    title: "Fenz Akademi — Yeni Nesil Eğitim Platformu",
    description:
      "Ortaokul öğrencileri için video eğitimler, interaktif testler ve oyunlaştırma ile öğrenmeyi eğlenceli hale getiren eğitim platformu.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
