import type { Metadata } from "next";
import { Inria_Sans, Inria_Serif, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

// Only the weights actually used in the approved Figma design are loaded,
// to keep font payload minimal. See docs/QA-CHECKLIST.md / performance
// notes before adding additional weights or styles.
const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "400", "500", "700"],
  variable: "--font-inter",
  display: "swap",
});

const inriaSans = Inria_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-inria-sans",
  display: "swap",
});

const inriaSerif = Inria_Serif({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-inria-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // metadataBase alone does not emit a canonical tag — alternates.canonical
  // must be set explicitly. Child pages can override this per-route.
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable} ${inriaSans.variable} ${inriaSerif.variable}`}
    >
      <body className="min-h-full flex flex-col font-body bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
