import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Account } from '@motrac/shared'
import { AddAccountModal } from '@/components/AddAccountModal'

export default async function AccountsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: rawAccounts } = await supabase
    .from('accounts')
    .select('*')
    .order('name');
  
  const accounts: Account[] = rawAccounts || [];
  const formatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-[-0.02em]">My Accounts</h1>
        <AddAccountModal />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Account Cards */}
        {accounts.map((acc) => {
          const isExcluded = !acc.include_in_net_worth;
          return (
            <div key={acc.id} className="flex flex-col justify-between rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm transition-shadow hover:shadow-md border-t-[6px]" style={{borderTopColor: acc.color || '#2563EB'}}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#F1F5F9] border border-[#E5E7EB]/50 text-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]">
                    {acc.icon || '🏦'}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#94a3b8]">{acc.type.replace('_', ' ')}</span>
                </div>
                <h3 className="font-bold text-[18px] text-[#0f172a]">{acc.name}</h3>
              </div>
              <div className="mt-8">
                <div className="text-[26px] font-bold text-[#0f172a] tracking-tight">{formatter.format(Number(acc.balance)).replace('Rp', '').trim()} <span className="text-[16px] text-[#64748b]">IDR</span></div>
                {isExcluded && (
                   <div className="text-[12px] font-medium text-[#f59e0b] mt-1.5 flex items-center gap-1.5 bg-amber-50 rounded-md py-1 px-2 border border-amber-100/50 w-fit">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                     Excluded from net worth
                   </div>
                )}
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}
