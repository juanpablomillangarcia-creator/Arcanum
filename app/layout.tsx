import type { Metadata, Viewport } from "next";
import { Cinzel_Decorative, Cormorant_Garamond, Cormorant_SC, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Shell } from "@/src/components/Shell";

const cinzel = Cinzel_Decorative({ variable: "--font-cinzel", subsets: ["latin"], weight: ["400", "700", "900"], display: "swap" });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], display: "swap" });
const cormorantSC = Cormorant_SC({ variable: "--font-cormorant-sc", subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "600"], display: "swap" });

export const metadata: Metadata = {
  title: "ARCANUM — Herramientas de D&D 5e",
  description: "Caja de herramientas para dirigir y jugar D&D 5e en español: dados, combate, oráculo, generadores y compendio.",
  applicationName: "ARCANUM",
};

export const viewport: Viewport = {
  themeColor: "#0a0709",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      data-design="A"
      className={`${cinzel.variable} ${cormorant.variable} ${cormorantSC.variable} ${jetbrains.variable}`}
    >
      <body>
        <div className="noise" aria-hidden />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
