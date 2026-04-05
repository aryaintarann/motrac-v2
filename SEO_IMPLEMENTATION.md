# DanaRoute SEO Implementation Guide

## ✅ SEO Features Implemented

### 1. Metadata Configuration (src/app/layout.tsx)
- **Title Template**: "Page Title | DanaRoute" format
- **Description**: Keyword-rich description in Indonesian
- **Keywords**: 14 targeted keywords for Indonesian market
- **Open Graph**: Full configuration for Facebook, LinkedIn, WhatsApp
- **Twitter Card**: summary_large_image for Twitter sharing
- **Canonical URL**: https://danaroute.com
- **Language Alternates**: id-ID (primary), en-US
- **Robots**: Full indexing with max-image-preview: large

### 2. Sitemap (src/app/sitemap.ts)
Auto-generated at `/sitemap.xml` with:
- Homepage (priority: 1.0)
- Login/Signup pages (priority: 0.8)
- Download page (priority: 0.7)
- Support page (priority: 0.5)
- Privacy/Terms (priority: 0.3)

### 3. Robots.txt (src/app/robots.ts)
- Allows all public pages
- Blocks private routes: `/api/`, `/dashboard/`, `/auth/`
- Points to sitemap location

### 4. Web App Manifest (src/app/manifest.ts)
PWA-ready with:
- App icons (72x72 to 512x512)
- Theme color: #3B82F6 (blue)
- App shortcuts
- Screenshots metadata

### 5. Structured Data (JSON-LD)
- **SoftwareApplication** schema for app stores
- **WebSite** schema with search action
- Rating: 4.8/5 (placeholder - update with real data)

### 6. Page-Level SEO
Each page has unique:
- Title
- Description
- OpenGraph tags
- Canonical URL

---

## 🔧 Required Actions

### 1. Google Search Console Setup
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://danaroute.com`
3. Verify ownership (HTML tag method recommended)
4. Update `verification.google` in layout.tsx with your code:
   ```typescript
   verification: {
     google: "your-actual-verification-code",
   },
   ```

### 2. Create OG Image
Create `/public/og-image.png` (1200x630px) with:
- DanaRoute logo
- Tagline
- App screenshot preview
- Blue/white brand colors

### 3. Create App Icons
Create icons in `/public/icons/`:
```
icon-72x72.png
icon-96x96.png
icon-128x128.png
icon-144x144.png
icon-152x152.png
icon-192x192.png
icon-384x384.png
icon-512x512.png
```

### 4. Submit to Google
1. Login to Google Search Console
2. Submit sitemap: `https://danaroute.com/sitemap.xml`
3. Request indexing for main pages

### 5. Google Business Profile (Optional)
If applicable, create a Google Business Profile for local SEO.

---

## 📊 SEO Monitoring

### Recommended Tools
1. **Google Search Console** - Track rankings, clicks, impressions
2. **Google Analytics 4** - User behavior analysis
3. **Ahrefs/SEMrush** - Keyword tracking (paid)
4. **PageSpeed Insights** - Performance monitoring

### Key Metrics to Track
- Organic traffic
- Keyword rankings for target terms
- Click-through rate (CTR)
- Core Web Vitals scores
- Indexed pages count

---

## 🎯 Target Keywords

### Primary Keywords (High Priority)
1. "aplikasi keuangan" - Finance app
2. "money tracker indonesia" - Money tracker Indonesia
3. "aplikasi catat pengeluaran" - Expense tracking app
4. "budget planner gratis" - Free budget planner
5. "AI financial advisor" - AI financial advisor

### Secondary Keywords
- pengelolaan keuangan pribadi
- catat keuangan harian
- manajemen uang
- aplikasi budgeting
- expense tracker indonesia

### Long-tail Keywords
- "aplikasi catat pengeluaran gratis terbaik"
- "cara kelola keuangan dengan AI"
- "budget 50/30/20 calculator"

---

## 🚀 Future SEO Enhancements

### Content Marketing
1. Create blog at `/blog` with financial tips
2. Write guides: "Cara Mengelola Keuangan Bulanan"
3. Create infographics for social sharing

### Technical SEO
1. Implement AMP pages for mobile
2. Add FAQ schema for help page
3. Implement breadcrumb schema
4. Add video schema for tutorials

### Link Building
1. Get listed on app directories
2. Guest posts on finance blogs
3. Press releases for major features

---

## 📝 Metadata Quick Reference

```typescript
// For new pages, use this template:
export const metadata: Metadata = {
  title: 'Page Title', // Uses template: "Page Title | DanaRoute"
  description: 'Page description with keywords...',
  openGraph: {
    title: 'Page Title',
    description: 'Page description for social...',
    url: 'https://danaroute.com/page-path',
  },
  alternates: {
    canonical: 'https://danaroute.com/page-path',
  },
}
```

---

## ✅ SEO Checklist

- [x] Meta title and description
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Canonical URLs
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Structured data (JSON-LD)
- [x] Web app manifest
- [x] Language declaration (lang="id")
- [x] Mobile-friendly viewport
- [ ] Create OG image
- [ ] Create app icons
- [ ] Google Search Console verification
- [ ] Google Analytics integration
- [ ] Submit sitemap to Google
- [ ] Bing Webmaster Tools (optional)
