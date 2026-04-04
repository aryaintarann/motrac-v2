import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AIChatbot } from '@/components/AIChatbot'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Financial Advisor',
  description: 'Dapatkan saran keuangan personal dari AI advisor DanaRoute. Analisis pengeluaran, rekomendasi budgeting, dan tips menghemat uang.',
  robots: { index: false, follow: false }, // Dashboard pages should not be indexed
}

export default async function AIAdvisorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <div className="mb-6">
         <h1 className="text-[26px] font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">AI Consultant</span>
         </h1>
         <p className="text-[14px] text-gray-500 mt-1.5">Your personal financial assistant, ready to help anytime.</p>
      </div>

      <AIChatbot />
    </div>
  )
}
