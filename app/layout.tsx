import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Myra Trip Companion Demo",
  description: "Turn travel inspiration into a verified, budget-aware and bookable trip.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}</body></html>;
}
