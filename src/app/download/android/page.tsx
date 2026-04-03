'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function AndroidDownloadPage() {
  const [showAlert, setShowAlert] = useState(false)

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 5000)
    // TODO: Replace with actual APK download link
    // window.location.href = '/path/to/motrac.apk'
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center"
      style={{ background: '#FAFAFA', color: '#111827', fontFamily: "'Manrope', 'Inter', sans-serif", padding: '24px' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap');
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .bounce-icon { animation: bounce 2s ease-in-out infinite; }
        .alert-slide { animation: slideDown 0.3s ease forwards; }
      `}</style>

      {/* Alert Message */}
      {showAlert && (
        <div className="alert-slide" style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '12px', padding: '16px 24px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxWidth: '90%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#92400E', margin: 0 }}>
              Link download APK akan segera ditambahkan. Silakan hubungi admin untuk mendapatkan file APK.
            </p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '600px', width: '100%', background: '#fff', borderRadius: '24px', padding: '48px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        
        {/* Android Icon */}
        <div className="bounce-icon" style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #3DDC84, #2FC574)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 12px 32px rgba(61,220,132,0.3)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
            <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.5 11.5 0 0 0-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C4.1 11.36 2.5 14.15 2.5 17.3h19c0-3.15-1.6-5.94-3.9-7.82zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
          </svg>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 900, color: '#111827', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Download Motrac untuk Android
        </h1>
        
        <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.7, marginBottom: '32px' }}>
          Kelola keuangan Anda dengan mudah langsung dari smartphone Android. Download file APK dan install sekarang.
        </p>

        {/* Download Info Box */}
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '20px', marginBottom: '32px', textAlign: 'left' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '2px' }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E40AF', margin: '0 0 8px' }}>Cara Install APK:</h3>
              <ol style={{ fontSize: '13px', color: '#1E3A8A', lineHeight: 1.6, margin: 0, paddingLeft: '20px' }}>
                <li>Download file APK</li>
                <li>Buka Settings → Security → Install Unknown Apps</li>
                <li>Izinkan instalasi dari browser atau file manager</li>
                <li>Buka file APK yang sudah didownload</li>
                <li>Tap Install dan tunggu proses selesai</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <a 
          href="#" 
          onClick={handleDownload}
          style={{ 
            display: 'block', 
            width: '100%', 
            background: 'linear-gradient(135deg, #3DDC84, #2FC574)', 
            color: '#fff', 
            fontSize: '16px', 
            fontWeight: 700, 
            padding: '16px 32px', 
            borderRadius: '12px', 
            textDecoration: 'none', 
            boxShadow: '0 4px 20px rgba(61,220,132,0.3)', 
            transition: 'transform 0.2s, box-shadow 0.2s',
            marginBottom: '24px',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Download APK (Latest)</span>
          </div>
        </a>

        <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#6B7280', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Aman & Terverifikasi</span>
          </div>
          <div style={{ color: '#D1D5DB' }}>•</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Gratis Selamanya</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '24px' }}>
          <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '16px' }}>
            Sudah punya akun?
          </p>
          <Link 
            href="/login" 
            style={{ 
              display: 'inline-block',
              color: '#2563EB', 
              fontSize: '15px', 
              fontWeight: 700, 
              textDecoration: 'none',
              padding: '8px 24px',
              border: '2px solid #2563EB',
              borderRadius: '9999px',
              transition: 'all 0.2s'
            }}
          >
            Login ke Akun
          </Link>
        </div>

        <Link 
          href="/" 
          style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px',
            color: '#6B7280', 
            fontSize: '14px', 
            fontWeight: 600, 
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Kembali ke Beranda
        </Link>
      </div>

      {/* Bottom note */}
      <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '32px', textAlign: 'center', maxWidth: '500px' }}>
        Aplikasi ini belum tersedia di Google Play Store. Download dan install file APK secara manual untuk menggunakan aplikasi Motrac.
      </p>
    </div>
  )
}
