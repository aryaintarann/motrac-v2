import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { GenerateInsightButton } from '@/components/GenerateInsightButton'

export const metadata = {
  title: 'AI Advisor | Motrac',
}

export default async function AIAdvisorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: insights } = await supabase.from('ai_insights')
    .select('*')
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false })

  return (
    <div className="mx-auto max-w-[800px]">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight flex items-center gap-3">
             <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">AI Advisor</span>
          </h1>
          <p className="text-[14px] text-gray-500 mt-1.5">Get personalized insights powered by Gemini 2.5 Flash.</p>
        </div>
        <GenerateInsightButton />
      </div>

      <div className="flex flex-col gap-6">
        {insights?.map(insight => (
          <div key={insight.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden">
             
             <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-sm border border-blue-100">
                  ✨
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[15px]">Monthly Pacing Analysis</h3>
                  <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wider">{new Date(insight.generated_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} • {insight.period}</div>
                </div>
             </div>
             
             <div className="relative z-10 p-5 rounded-xl bg-gray-50/80 border border-gray-100 text-[15px] leading-relaxed text-gray-800 whitespace-pre-wrap">
               {insight.content.replace(/\*\*/g, '')}
             </div>
             
             {/* Decorative blob */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
          </div>
        ))}
        {(!insights || insights.length === 0) && (
          <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
             <div className="text-4xl mb-4 opacity-50">🤖</div>
             <h3 className="font-bold text-gray-900 mb-2">No Insights Yet</h3>
             <p className="text-[14px] text-gray-500 max-w-sm mx-auto">
               Click the button above to generate your first AI financial analysis based on your current month's spending pace.
             </p>
          </div>
        )}
      </div>
    </div>
  )
}
