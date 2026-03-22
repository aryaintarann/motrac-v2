'use client'

import { useState } from 'react'
import { createCategory } from '@/app/(dashboard)/categories/actions'
import { useRouter } from 'next/navigation'

export function AddCategoryModal({ parentId, parentName, parentType }: { parentId: string, parentName: string, parentType: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    setLoading(true)
    formData.append('parent_id', parentId)
    formData.append('type', parentType)
    try {
      await createCategory(formData)
      setIsOpen(false)
      router.refresh()
    } catch (e: any) {
      alert(e.message)
    }
    setLoading(false)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="mt-4 flex items-center justify-center w-full gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all"
      >
        <span>+ Add Sub-Category {parentName && `to ${parentName}`}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] w-full max-w-sm shadow-xl relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                 <h3 className="font-bold text-[18px] text-gray-900">New Category</h3>
                 <p className="text-[12px] text-gray-500 mt-0.5">Parent: {parentName}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 flex items-center justify-center transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <form action={onSubmit} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Category Name</label>
                <input 
                  name="name" 
                  autoFocus
                  placeholder="e.g. Groceries, Netflix, Gas" 
                  required
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-[14px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Emoji Icon (Optional)</label>
                <input 
                  name="icon" 
                  placeholder="e.g. 🍎" 
                  maxLength={5}
                  className="w-20 rounded-xl border border-gray-200 px-4 py-2.5 text-[18px] text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-blue-600 py-3 text-[14px] font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
