'use client'

import { useRef } from 'react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[var(--primary)] hover:bg-gray-50 flex items-center gap-2 print:hidden"
    >
      <span>📄</span> Export PDF
    </button>
  )
}
