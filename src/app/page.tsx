import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Motrac | Your Money. Your Rules.',
  description: 'Track every expense, plan your budget, and let AI guide you to your financial goals. Free forever.',
}

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: '#FAFAFA', color: '#111827', fontFamily: "'Manrope', 'Inter', sans-serif" }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .float { animation: float 6s ease-in-out infinite; }
        .fadeup { animation: fadeInUp 0.7s ease forwards; }
        .fadeup-delay { animation: fadeInUp 0.7s ease 0.2s forwards; opacity: 0; }
        .fadeup-delay2 { animation: fadeInUp 0.7s ease 0.4s forwards; opacity: 0; }
        .bento-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .bento-card:hover { transform: scale(1.02); box-shadow: 0 8px 32px rgba(37,99,235,0.12) !important; }
        .nav-link { color: #6B7280; text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: #111827; }
        .gradient-text {
          background-image: linear-gradient(135deg, #2563EB, #7C3AED);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        @media (prefers-reduced-motion: reduce) {
          .float, .fadeup, .fadeup-delay, .fadeup-delay2, .bento-card { animation: none !important; }
          .bento-card:hover { transform: none !important; }
        }
        @media (max-width: 900px) {
          .bento-grid { grid-template-columns: 1fr !important; }
          .bento-grid > div { grid-column: span 1 !important; }
          .nav-links { display: none !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(24px)', background: 'rgba(250,250,250,0.85)', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <span style={{ fontWeight: 900, fontSize: '20px', letterSpacing: '0.08em', color: '#111827' }}>MOTRAC</span>

          {/* Nav Links */}
          <nav className="nav-links" style={{ display: 'flex', gap: '32px', fontSize: '15px', fontWeight: 500 }}>
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">Pricing</a>
            <a href="#features" className="nav-link">About</a>
          </nav>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/login" style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', textDecoration: 'none' }}>Log in</Link>
            <Link href="/signup" style={{ background: '#2563EB', color: '#fff', fontSize: '14px', fontWeight: 700, padding: '10px 20px', borderRadius: '9999px', textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', background: '#fff', borderBottom: '1px solid #F3F4F6' }}>
        {/* Background grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none', opacity: 0.6 }} />
        {/* Blue glow */}
        <div style={{ position: 'absolute', top: '-160px', left: '10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="hero-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

          {/* ── LEFT: Copy ── */}
          <div>
            {/* Eyebrow */}
            <div className="fadeup" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '9999px', padding: '6px 14px', marginBottom: '32px', fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
              Personal Finance, Simplified
            </div>

            {/* Headline */}
            <h1 className="fadeup" style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.04em', margin: '0 0 24px', color: '#111827' }}>
              One app to rule{' '}
              <span className="gradient-text">all your money.</span>
            </h1>

            <p className="fadeup-delay" style={{ fontSize: '18px', lineHeight: 1.75, color: '#6B7280', margin: '0 0 40px', maxWidth: '460px' }}>
              Track accounts, control budgets, monitor debts, and get AI-driven insights — all in one beautifully simple dashboard.
            </p>

            {/* CTAs */}
            <div className="fadeup-delay" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}>
              <Link href="/signup" style={{ background: '#2563EB', color: '#fff', fontSize: '16px', fontWeight: 700, padding: '14px 28px', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,99,235,0.3)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Get started free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <a href="#features" style={{ background: '#fff', border: '1.5px solid #E5E7EB', color: '#374151', fontSize: '16px', fontWeight: 600, padding: '14px 28px', borderRadius: '12px', textDecoration: 'none' }}>
                See how it works
              </a>
            </div>

            {/* Social proof / stats */}
            <div className="fadeup-delay2" style={{ display: 'flex', gap: '32px', paddingTop: '32px', borderTop: '1px solid #F3F4F6' }}>
              {[['500+', 'Active Users'], ['Rp 2.4B+', 'Tracked'], ['4.9★', 'Rating']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#111827', letterSpacing: '-0.02em' }}>{val}</div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 600, marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Dashboard Mockup ── */}
          <div className="fadeup-delay" style={{ position: 'relative' }}>
            {/* Floating badges */}
            <div className="float" style={{ position: 'absolute', top: '-16px', right: '-8px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontSize: '13px', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 2 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
              +Rp 3.2M this month
            </div>
            <div style={{ position: 'absolute', bottom: '32px', left: '-16px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontSize: '13px', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 2 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              Budget: 68% used
            </div>

            {/* Main dashboard card */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(37,99,235,0.1), 0 4px 16px rgba(0,0,0,0.05)' }}>
              {/* Card header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FCA5A5' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FCD34D' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6EE7B7' }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#9CA3AF' }}>motrac.app/dashboard</div>
                <div style={{ width: '48px' }} />
              </div>

              <div style={{ padding: '24px' }}>
                {/* Net worth */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Total Net Worth</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <div style={{ fontSize: '40px', fontWeight: 900, color: '#111827', letterSpacing: '-0.03em' }}>Rp 48.5M</div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#10B981', background: '#D1FAE5', borderRadius: '8px', padding: '3px 8px' }}>↑ 12.4%</span>
                  </div>
                </div>

                {/* Mini chart */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '64px', marginBottom: '20px', padding: '4px 0' }}>
                  {[30,50,38,70,45,85,60,95,55,80,70,100].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0', background: i >= 9 ? '#2563EB' : i >= 6 ? '#93C5FD' : '#EFF6FF', transition: 'height 0.3s ease' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#D1D5DB', marginBottom: '20px', fontWeight: 600 }}>
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => <span key={m}>{m.slice(0,1)}</span>)}
                </div>

                {/* Account rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {[
                    ['💳', 'BCA Debit', 'Rp 18.2M', '#2563EB'],
                    ['🏦', 'Mandiri', 'Rp 22.1M', '#7C3AED'],
                    ['💰', 'Cash', 'Rp 8.2M', '#10B981'],
                  ].map(([icon, name, balance, color]) => (
                    <div key={String(name)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#F9FAFB', borderRadius: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{name}</div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>Main Account</div>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>{balance}</div>
                    </div>
                  ))}
                </div>

                {/* Budget progress */}
                <div style={{ padding: '12px', background: '#FFF7ED', borderRadius: '12px', border: '1px solid #FED7AA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    <span style={{ color: '#B45309' }}>Monthly Budget</span>
                    <span style={{ color: '#F97316' }}>Rp 3.4M / 5M</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '9999px', background: '#FDBA74', overflow: 'hidden' }}>
                    <div style={{ width: '68%', height: '100%', borderRadius: '9999px', background: '#F97316' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── FEATURES BENTO GRID ── */}
      <section id="features" style={{ padding: '100px 24px 120px', background: '#F9FAFB' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'inline-block', fontSize: '12px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px', background: 'rgba(124,58,237,0.12)', borderRadius: '9999px', padding: '6px 16px', border: '1px solid rgba(124,58,237,0.3)' }}>
              Everything You Need
            </div>
            <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#111827', margin: 0 }}>
              Built for how you<br />
              <span className="gradient-text">actually live.</span>
            </h2>
          </div>

          {/* Bento grid */}
          <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gridTemplateRows: 'auto', gap: '16px' }}>

            {/* Card 1 — Large, spans 7 columns */}
            <div className="bento-card" style={{ gridColumn: 'span 7', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '40px', position: 'relative', overflow: 'hidden', minHeight: '280px' }}>
              <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06), transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>Smart Accounts</h3>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.7, margin: 0, maxWidth: '320px' }}>Track all your cash, bank accounts, e-wallets, and investments in one unified, real-time view.</p>
              <div style={{ marginTop: '32px', display: 'flex', gap: '8px' }}>
                {['Cash', 'BCA', 'GoPay', 'OVO'].map(tag => (
                  <span key={tag} style={{ background: '#F3F4F6', borderRadius: '9999px', padding: '5px 12px', fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Card 2 — Small, spans 5 columns */}
            <div className="bento-card" style={{ gridColumn: 'span 5', background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '24px', padding: '40px', position: 'relative', overflow: 'hidden', minHeight: '280px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>Budget Control</h3>
              <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.7, margin: 0 }}>Set weekly &amp; monthly limits. Visual progress bars keep you on track — effortlessly.</p>
              <div style={{ marginTop: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9CA3AF', marginBottom: '8px' }}>
                  <span>Monthly Spend</span><span style={{ color: '#7C3AED', fontWeight: 700 }}>68%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '9999px', background: '#E5E7EB' }}>
                  <div style={{ width: '68%', height: '100%', borderRadius: '9999px', background: 'linear-gradient(90deg, #7C3AED, #a78bfa)' }} />
                </div>
              </div>
            </div>

            {/* Card 3 — Medium, spans 5 columns */}
            <div className="bento-card" style={{ gridColumn: 'span 5', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '40px', minHeight: '240px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>AI Advisor</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7, margin: 0 }}>Personalized, AI-driven insights on your spending habits — save smarter, not harder.</p>
            </div>

            {/* Card 4 — Medium, spans 7 columns */}
            <div className="bento-card" style={{ gridColumn: 'span 7', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '40px', position: 'relative', overflow: 'hidden', minHeight: '240px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>Debt Tracker</h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7, margin: '0 0 28px', maxWidth: '360px' }}>Know exactly who owes you and what you owe. Never lose track of a payment again.</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#10B981' }}>+Rp 1.2M owed to you</div>
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>-Rp 800K you owe</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA STRIP ── */}
      <section style={{ padding: '100px 24px', textAlign: 'center', background: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.06), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 900, letterSpacing: '-0.03em', color: '#111827', margin: '0 0 20px' }}>
            Ready to take control?
          </h2>
          <p style={{ fontSize: '17px', color: '#6B7280', marginBottom: '40px', lineHeight: 1.7 }}>
            Join the smart generation managing their money with Motrac. Free. Private. Powerful.
          </p>
          <Link href="/signup" style={{ display: 'inline-block', background: '#2563EB', color: '#fff', fontSize: '16px', fontWeight: 700, padding: '18px 40px', borderRadius: '9999px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(37,99,235,0.25)' }}>
            Create free account
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #E5E7EB', padding: '40px 24px', background: '#FAFAFA' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <span className="gradient-text" style={{ fontWeight: 900, fontSize: '17px', letterSpacing: '0.08em' }}>MOTRAC</span>
          <p style={{ fontSize: '14px', color: '#9CA3AF', margin: 0 }}>© {new Date().getFullYear()} Motrac. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: 500, color: '#9CA3AF' }}>
            <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Terms</a>
            <a href="#" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
