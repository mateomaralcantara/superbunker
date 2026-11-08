import "./globals.css";
import { Chivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";

const display = Chivo({ subsets: ["latin"], weight: ["600", "800", "900"], variable: "--f-display", display: "swap" });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--f-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--f-mono", display: "swap" });

export const metadata = {
  title: "SuperBunker — ISTEM Cyber Range",
  description: "Plataforma de laboratorios de ciberseguridad en entorno controlado"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
