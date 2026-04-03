import Link from 'next/link'

export const metadata = { title: 'Terms of Service | Motrac' }

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] text-[#111827]" style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(24px)', background: 'rgba(250,250,250,0.85)', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 900, fontSize: '20px', letterSpacing: '0.08em', color: '#111827', textDecoration: 'none' }}>MOTRAC</Link>
          <Link href="/signup" style={{ background: '#2563EB', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '8px 16px', borderRadius: '9999px', textDecoration: 'none' }}>Get Started</Link>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: '800px', margin: '0 auto', padding: '80px 24px', width: '100%' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '24px' }}>Terms of Service</h1>
        <p style={{ fontSize: '16px', color: '#4B5563', lineHeight: 1.8, marginBottom: '40px' }}>
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div style={{ fontSize: '16px', color: '#4B5563', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <p>Welcome to Motrac. By accessing or using our application, you agree to comply with and be bound by the following terms.</p>
          
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '16px' }}>1. Acceptance of Terms</h2>
          <p>By registering for an account or using Motrac, you confirm that you accept these Terms of Service. If you do not agree to these terms, you must not use our services.</p>
          
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '16px' }}>2. User Responsibilities</h2>
          <p>You are responsible for maintaining the security of your account, passwords, and multi-factor authentication methods. You agree that Motrac cannot and will not be liable for any loss or damage from your failure to comply with this security obligation or from unauthorized access to your account due to your own negligence.</p>
          
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '16px' }}>3. Service Availability and Changes</h2>
          <p>We are constantly improving Motrac. We reserve the right to modify, suspend, or discontinue the service (or any part thereof) with or without notice at any time. We shall not be liable to you or to any third party for any modification, price change, suspension, or discontinuance of the service.</p>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '16px' }}>4. Financial Advice Disclaimer</h2>
          <p>Motrac provides tools and AI-driven insights to help you track and manage your finances. However, none of the information provided by the software constitutes professional financial, tax, or legal advice. You are solely responsible for your financial decisions.</p>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #E5E7EB', padding: '40px 24px', background: '#FAFAFA', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>© {new Date().getFullYear()} Motrac. All rights reserved.</p>
      </footer>
    </div>
  )
}
