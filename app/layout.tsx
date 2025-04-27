import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Metadata } from "next";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RoboRush - Energy Collection Game",
  description:
    "Navigate your robot through mazes, collect energy orbs, and avoid hazards in this exciting arcade game!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <Navigation />
          <main className="container mx-auto px-4 pt-16 pb-8 flex-grow">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        <Script src="/register-sw.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
