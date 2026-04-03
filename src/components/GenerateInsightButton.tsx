'use client'

import { useState } from 'react'
import { generateInsights } from '@/app/(dashboard)/actions/generateInsights'

export function GenerateInsightButton() {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      await generateInsights()
    } catch (e: any) {
      alert("AI Generation Error: " + e.message)
    }
    setLoading(false)
  }

  return (
    <button 
      onClick={handleGenerate}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-lg bg-[#111827] hover:bg-black px-5 py-2.5 text-[14px] font-semibold transition-colors shadow-sm mt-4 ${loading ? 'opacity-70 cursor-wait' : ''}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Analyzing spending...
        </>
      ) : (
        <>
          <span>✨</span> Get AI Advice
        </>
      )}
    </button>
  )
}
