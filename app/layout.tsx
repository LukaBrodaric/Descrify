import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/language-context";

export const metadata: Metadata = {
  metadataBase: new URL("https://descrify.xyz"),
  title: "Descrify - AI-Powered Property Descriptions",
  description: "Generate SEO-optimized descriptions for properties and vacation rentals using AI",
   keywords: [
    "AI opisi nekretnina",
    "SEO opisi nekretnina",
    "generator oglasa za nekretnine",
    "AI real estate copywriting",
    "opisi apartmana",
    "vacation rental descriptions",
  ],
  applicationName: "Descrify",
  authors: [{ name: "Luka Brodarič" }],
  creator: "Luka Brodarič",
   robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "app\favicon.ico",
     shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
