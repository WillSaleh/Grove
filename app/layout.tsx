import type { Metadata } from "next";
import { Inter, Sora, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700", "800"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: ["400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Grove — YV Social",
  description: "A living timeline of your walk with God.",
};

// Applies the saved theme choice (light/auto/dark) and accent color before first paint — no flash.
// Mirrors lib/useTheme.ts; the accent is auto-lightened in dark mode.
const THEME_BOOTSTRAP = `(function(){try{var el=document.documentElement,t=localStorage.getItem('yv-theme')||'auto',r=t==='auto'?((window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'):t;el.setAttribute('data-theme',r);var c=localStorage.getItem('yv-accent')||'#01356D';function hx(x){x=x.replace('#','');if(x.length===3)x=x.split('').map(function(y){return y+y}).join('');return[0,2,4].map(function(i){return parseInt(x.slice(i,i+2),16)})}function th(a){return'#'+a.map(function(v){return Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')}).join('')}function li(x,a){return th(hx(x).map(function(v){return v+(255-v)*a}))}function dk(x,a){return th(hx(x).map(function(v){return v*(1-a)}))}var d=r==='dark',m=d?li(c,.45):c,s=d?li(c,.2):dk(c,.24);el.style.setProperty('--accent',m);el.style.setProperty('--accent-strong',s);el.style.setProperty('--timeline',m);el.style.setProperty('--timeline-strong',s);}catch(e){}})();`;

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} ${sourceSerif.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        {/* Phosphor icon web font, loaded per-weight (the bare package URL serves JS, not CSS). */}
        <link href="https://unpkg.com" rel="preconnect" crossOrigin="" />
        <link href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/thin/style.css" rel="stylesheet" />
        <link href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/light/style.css" rel="stylesheet" />
        <link href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" rel="stylesheet" />
        <link href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/bold/style.css" rel="stylesheet" />
        <link href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css" rel="stylesheet" />
        <link href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/duotone/style.css" rel="stylesheet" />
      </head>
      <body className="h-full font-sans antialiased">{children}</body>
    </html>
  );
}
