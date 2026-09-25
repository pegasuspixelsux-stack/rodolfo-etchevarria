import type { Metadata } from "next";
import { Geist, Geist_Mono, Hurricane, Inter } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const script = Hurricane({
  variable: "--font-script",
  weight: "400",
  subsets: ["latin"],
});

const heading = Inter({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dealio — Encuentra tu próxima máquina de precisión",
  description:
    "Dealio es una concesionaria de alta gama que ofrece una selección curada de sedanes, SUVs y vehículos de alto rendimiento diseñados con precisión.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${script.variable} ${heading.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive">
          {`try {
  var theme = localStorage.getItem('theme');
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
} catch (e) {}`}
        </Script>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
