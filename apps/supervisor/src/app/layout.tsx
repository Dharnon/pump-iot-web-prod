import type { Metadata } from "next";
import { Dancing_Script, Geist, Geist_Mono, Orbitron } from "next/font/google";

import { LanguageProvider } from "@/lib/language-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: "Pump IoT - Flowserve",
  description: "Sistema de gestion de pruebas de bombas",
};

const themeInitScript = `
  (() => {
    try {
      const storedTheme = localStorage.getItem("theme");
      const shouldUseDark = storedTheme !== "light";
      document.documentElement.classList.toggle("dark", shouldUseDark);
    } catch {
      document.documentElement.classList.add("dark");
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dancingScript.variable} ${orbitron.variable} bg-background text-foreground antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
