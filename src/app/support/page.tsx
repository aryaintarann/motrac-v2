import Link from 'next/link'

export const metadata = { title: 'Support | Motrac' }

export default function SupportPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#111827]" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(24px)', background: 'rgba(250,250,250,0.85)', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 900, fontSize: '20px', letterSpacing: '0.08em', color: '#111827', textDecoration: 'none' }}>MOTRAC</Link>
          <Link href="/signup" style={{ background: '#2563EB', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '8px 16px', borderRadius: '9999px', textDecoration: 'none' }}>Get Started</Link>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '80px 24px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '16px' }}>How can we help?</h1>
          <p style={{ fontSize: '18px', color: '#6B7280' }}>Our team is here to support your financial journey.</p>
        </div>
        
        <div style={{ display: 'grid', gap: '32px' }}>
          <div style={{ padding: '32px', background: '#fff', borderRadius: '24px', border: '1px solid #E5E7EB', boxShadow: '0 12px 24px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>Email Support</h2>
            <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.7, marginBottom: '20px' }}>
              For general inquiries, account assistance, multi-factor authentication resets, or technical issues, please email our support desk. We aim to respond within 24 hours.
            </p>
            <a href="mailto:support@motrac.app" style={{ display: 'inline-block', background: '#FAFAFA', border: '1px solid #E5E7EB', color: '#111827', fontSize: '14px', fontWeight: 700, padding: '10px 20px', borderRadius: '8px', textDecoration: 'none' }}>
              support@motrac.app
            </a>
          </div>

          <div style={{ padding: '32px', background: '#fff', borderRadius: '24px', border: '1px solid #E5E7EB', boxShadow: '0 12px 24px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16,185,129,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>Frequently Asked Questions</h2>
            <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: 1.7, marginBottom: '20px' }}>
              Check out our FAQs inside the dashboard for quick answers on budget setup, tracking debts, managing categories, and exporting your financial data.
            </p>
            <Link href="/" style={{ color: '#2563EB', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #E5E7EB', padding: '40px 24px', background: '#FAFAFA', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>© {new Date().getFullYear()} Motrac. All rights reserved.</p>
      </footer>
    </div>
  )
}
