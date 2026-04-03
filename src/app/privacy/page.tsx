import Link from 'next/link'

export const metadata = { title: 'Privacy Policy | Motrac' }

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#111827]" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(24px)', background: 'rgba(250,250,250,0.85)', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 900, fontSize: '20px', letterSpacing: '0.08em', color: '#111827', textDecoration: 'none' }}>MOTRAC</Link>
          <Link href="/signup" style={{ background: '#2563EB', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '8px 16px', borderRadius: '9999px', textDecoration: 'none' }}>Get Started</Link>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '80px 24px', width: '100%' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '24px' }}>Privacy Policy</h1>
        <p style={{ fontSize: '16px', color: '#4B5563', lineHeight: 1.8, marginBottom: '40px' }}>
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div style={{ fontSize: '16px', color: '#4B5563', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <p>At Motrac, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our personal finance application.</p>
          
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '16px' }}>1. Data Collection</h2>
          <p>We only collect the data necessary to provide our services to you. This includes your basic account information (name, email address) and the financial data you choose to input (transactions, budgets, accounts). We do not link or sync with your real bank accounts without your explicit, verifiable consent.</p>
          
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '16px' }}>2. Data Usage</h2>
          <p>Your data is strictly used to power your personal Motrac dashboard, calculate budgets, and provide you with AI-driven financial insights. <strong>We do not sell, rent, or share your personal financial data to third-party advertisers.</strong></p>
          
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '16px' }}>3. Data Security and Storage</h2>
          <p>We use industry-standard encryption protocols (TLS/SSL) to ensure that your data is safe during transit. At rest, your financial data is securely encrypted in our databases. We employ strict access controls to prevent unauthorized access.</p>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '16px' }}>4. Your Rights</h2>
          <p>You own your data. At any time, you can export your financial data into standard formats (like CSV). You also have the right to request the complete deletion of your account and all associated data from our servers.</p>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '16px' }}>5. Contact Us</h2>
          <p>If you have any questions or concerns about this Privacy Policy or how your data is handled, please contact us at <Link href="/support" style={{ color: '#2563EB', textDecoration: 'underline' }}>our support center</Link>.</p>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #E5E7EB', padding: '40px 24px', background: '#FAFAFA', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>© {new Date().getFullYear()} Motrac. All rights reserved.</p>
      </footer>
    </div>
  )
}
