import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Basic SEO
  title: {
    default: "DanaRoute - Aplikasi Kelola Keuangan Pribadi #1 Indonesia",
    template: "%s | DanaRoute"
  },
  description: "DanaRoute adalah aplikasi pengelolaan keuangan pribadi terbaik dengan AI advisor, budgeting 50/30/20, tracking pengeluaran & pemasukan, serta laporan keuangan lengkap. Gratis selamanya!",
  keywords: [
    "aplikasi keuangan",
    "money tracker",
    "pengelolaan keuangan",
    "budget planner",
    "expense tracker",
    "aplikasi catat pengeluaran",
    "financial planner",
    "AI financial advisor",
    "budgeting app",
    "personal finance",
    "danaroute",
    "aplikasi keuangan indonesia",
    "catat keuangan harian",
    "manajemen uang"
  ],
  authors: [{ name: "DanaRoute Team" }],
  creator: "DanaRoute",
  publisher: "DanaRoute",
  
  // Canonical & Base URL
  metadataBase: new URL("https://danaroute.com"),
  alternates: {
    canonical: "/",
    languages: {
      "id-ID": "/",
      "en-US": "/en"
    }
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://danaroute.com",
    siteName: "DanaRoute",
    title: "DanaRoute - Aplikasi Kelola Keuangan Pribadi #1 Indonesia",
    description: "Kelola keuangan dengan mudah! AI advisor, budgeting pintar, tracking otomatis. Download gratis sekarang.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DanaRoute - Smart Money Management App",
        type: "image/png",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "DanaRoute - Aplikasi Kelola Keuangan Pribadi #1 Indonesia",
    description: "Kelola keuangan dengan mudah! AI advisor, budgeting pintar, tracking otomatis. Download gratis sekarang.",
    images: ["/og-image.png"],
    creator: "@danaroute",
    site: "@danaroute",
  },
  
  // App Links
  applicationName: "DanaRoute",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DanaRoute",
  },
  
  // Verification (add your actual verification codes)
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
  
  // Category
  category: "finance",
  
  // Other
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${interFont.variable} antialiased h-full`}
    >
      <head>
        {/* JSON-LD Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "DanaRoute",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web, Android, iOS",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "IDR"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1000"
              },
              "description": "Aplikasi pengelolaan keuangan pribadi dengan AI advisor, budgeting 50/30/20, dan tracking otomatis.",
              "url": "https://danaroute.com",
              "image": "https://danaroute.com/og-image.png",
              "author": {
                "@type": "Organization",
                "name": "DanaRoute"
              }
            })
          }}
        />
        {/* JSON-LD for Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "DanaRoute",
              "url": "https://danaroute.com",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://danaroute.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
