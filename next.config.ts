import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Memory and performance optimization
  experimental: {
    optimizeServerReact: true,
    // Enable Turbopack filesystem cache for faster dev builds
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
  },

  // Webpack cache optimization to reduce memory usage
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // In production builds, use memory cache instead of filesystem cache
    // to reduce memory pressure from large disk caches
    if (config.cache && !dev) {
      config.cache = Object.freeze({
        type: 'memory',
      })
      config.cache.maxMemoryGenerations = 1 // Limit cache generations
    }
    
    // Reduce memory usage by limiting parallel processing
    if (!dev) {
      config.parallelism = 1
    }
    
    return config
  },

  // Add empty turbopack config to avoid warnings
  turbopack: {},

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://generativelanguage.googleapis.com https://*.supabase.co wss://*.supabase.co",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          }
        ],
      },
    ]
  },
};

export default nextConfig;
