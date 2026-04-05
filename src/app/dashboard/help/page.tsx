import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bantuan & FAQ',
  description: 'Temukan jawaban pertanyaan umum tentang DanaRoute - cara menggunakan aplikasi, keamanan data, dan fitur-fitur lainnya.',
  robots: { index: false, follow: false },
}

export default async function HelpPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const faqs = [
    {
      q: "How does the AI Pacing work?",
      a: "Our AI automatically parses your past transactions and current budget to give you real-time recommendations on your spending limits for the remaining days of the month, ensuring you never over-spend."
    },
    {
      q: "Is my bank data secure?",
      a: "Yes! For this Web Demo version, your data is securely stored on your personal Supabase instance with Row Level Security (RLS) enabled. Only your authenticated user can read or modify your financial logs."
    },
    {
      q: "Can I use DANAROUTE on my phone?",
      a: "A dedicated mobile experience built with React Native and Expo is currently in development! It will allow for native offline support and push notifications."
    },
    {
      q: "How do I hide my balance across the app?",
      a: "We understand privacy in public spaces. You can toggle the 'Hide Balance' button (Eye Icon) located at the top right of your header menu anytime. It will instantly mask all nominal amounts."
    }
  ]

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-[-0.02em]">Help & Support</h1>
        <p className="text-[14px] text-gray-500 mt-1">Need help managing your finances on DANAROUTE? We've got you covered.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        {/* Main Content Area */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* FAQ Section */}
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm">
            <h3 className="font-bold text-[#0f172a] text-[18px] mb-6">Frequently Asked Questions</h3>
            
            <div className="flex flex-col gap-5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                  <h4 className="font-bold text-[#0f172a] text-[15px] mb-2">{faq.q}</h4>
                  <p className="text-[14px] text-[#64748b] leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Contact Area */}
        <div className="md:col-span-4 flex flex-col gap-6">
          {/* Contact Support */}
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <h3 className="font-bold text-[#0f172a] text-[16px] mb-2">Still need help?</h3>
            <p className="text-[13px] text-[#64748b] leading-relaxed mb-6">
              Our support team is here for you. We aim to respond to all inquiries within 24 hours.
            </p>
            <a 
              href="mailto:contact@varsaweb.com" 
              className="w-full rounded-lg bg-[#2563EB] px-4 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
          </div>

          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm bg-gradient-to-b from-white to-gray-50">
            <h3 className="font-bold text-[#0f172a] text-[16px] mb-2">Version Information</h3>
            <div className="flex flex-col gap-2 mt-4 text-[13px]">
              <div className="flex justify-between items-center text-[#64748b]">
                <span>App Version</span>
                <span className="font-semibold text-gray-900">v2.1.0-web</span>
              </div>
              <div className="flex justify-between items-center text-[#64748b]">
                <span>Environment</span>
                <span className="font-semibold text-gray-900">Production</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
