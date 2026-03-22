import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Account } from '@motrac/shared'
import { AccountForm } from '@/components/AccountForm'

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
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">My Accounts</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Account Cards */}
        {accounts.map((acc) => (
          <div key={acc.id} className="flex flex-col justify-between rounded-xl bg-[var(--surface)] p-6 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md border-t-4" style={{borderTopColor: acc.color || 'var(--primary)'}}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{acc.icon || '🏦'}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{acc.type.replace('_', ' ')}</span>
              </div>
              <h3 className="font-semibold text-lg text-[var(--foreground)]">{acc.name}</h3>
            </div>
            <div className="mt-6">
              <div className="text-2xl font-bold text-[var(--text)]">{formatter.format(Number(acc.balance))}</div>
              {!acc.include_in_net_worth && (
                 <div className="text-xs text-gray-400 mt-1">Excluded from net worth</div>
              )}
            </div>
          </div>
        ))}

        {/* Add Account Card / Form */}
        <div className="col-span-1 rounded-xl bg-gray-50 border border-dashed border-gray-300 p-6">
          <h3 className="font-semibold mb-4 text-[var(--foreground)]">Add New Account</h3>
          <AccountForm />
        </div>
      </div>
    </div>
  )
}
