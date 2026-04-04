import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AddCategoryModal } from '@/components/AddCategoryModal'

export const metadata = {
  title: 'Categories | DANAROUTE',
}

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all user categories
  const { data: rawCategories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })

  const cats = rawCategories || []

  // Split into main categories and subcategories
  const mainCats = cats.filter(c => !c.parent_id)
  
  if (mainCats.length === 0) {
    return (
      <div className="mx-auto max-w-[800px] text-center py-24 flex flex-col items-center justify-center">
         <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-3xl shadow-sm border border-gray-200">
           🗂️
         </div>
         <h1 className="text-[24px] font-bold text-gray-900 tracking-tight mb-2">No Categories Found</h1>
         <p className="text-[14px] text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
           Your budget dictates your categories. Please go to the Dashboard and set your first monthly budget to automatically generate the 50/30/20 baseline categories (Needs, Wants, Savings).
         </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Category Organization</h1>
        <p className="text-[14px] text-gray-500 mt-1.5">Manage your financial buckets for the 50/30/20 budgeting rule.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {mainCats.map(main => {
          const children = cats.filter(c => c.parent_id === main.id)
          
          return (
            <div key={main.id} className="bg-white rounded-[24px] border border-gray-200 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col min-h-[300px]">
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${
                  main.budget_type === 'needs' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                  main.budget_type === 'wants' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                  main.budget_type === 'savings' ? 'bg-green-50 border-green-100 text-green-600' :
                  'bg-orange-50 border-orange-100 text-orange-600'
                }`}>
                  {main.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[18px] text-gray-900">{main.name}</h3>
                  <span className={`text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md mt-1 inline-block ${
                    main.type === 'expense' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {main.type}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2.5 flex-1">
                {children.map(child => (
                  <div key={child.id} className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-gray-100/80">
                     <span className="text-xl shrink-0 leading-none">{child.icon}</span>
                     <span className="font-semibold text-[14px] text-gray-800 truncate">{child.name}</span>
                  </div>
                ))}
                {children.length === 0 && (
                  <div className="text-[13px] text-gray-400 italic py-6 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                    No sub-categories yet
                  </div>
                )}
              </div>
              
              <AddCategoryModal parentId={main.id} parentName={main.name} parentType={main.type} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
