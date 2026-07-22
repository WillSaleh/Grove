import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Grove — YV Social",
  description: "A living timeline of your walk with God.",
};

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} h-full`}>
      <head>
        {/* Phosphor icon web font. The bare package URL serves JS, so we load the per-weight
            stylesheets directly — one per weight the Icon component uses (ph / ph-bold / ph-fill / ph-duotone). */}
        <link href="https://unpkg.com" rel="preconnect" crossOrigin="" />
        <link href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" rel="stylesheet" />
        <link href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/bold/style.css" rel="stylesheet" />
        <link href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css" rel="stylesheet" />
        <link href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/duotone/style.css" rel="stylesheet" />
      </head>
      <body className="h-full bg-parchment font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
