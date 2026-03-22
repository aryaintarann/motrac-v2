'use client'

import { useState } from 'react'
import { ProfileForm } from './ProfileForm'
import { SecurityForm } from './SecurityForm'

export function ProfileTabs({ initialUser }: { initialUser: any }) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-[15px] font-semibold transition-colors relative ${
            activeTab === 'profile' 
              ? 'text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          General Profile
          {activeTab === 'profile' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-4 text-[15px] font-semibold transition-colors relative ${
            activeTab === 'security' 
              ? 'text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Security & Data
          {activeTab === 'security' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="transition-all">
        {activeTab === 'profile' && (
          <ProfileForm user={initialUser} />
        )}
        
        {activeTab === 'security' && (
          <SecurityForm user={initialUser} />
        )}
      </div>
    </div>
  )
}
