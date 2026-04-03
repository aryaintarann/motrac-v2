'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function ProfileForm({ user }: { user: any }) {
  const supabase = createClient()
  const router = useRouter()
  
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
  const [nickname, setNickname] = useState(user.user_metadata?.nickname || '')
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '')
  
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  const currentAvatar = user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage({ text: '', type: '' })

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        nickname: nickname,
        avatar_url: avatarUrl
      }
    })

    if (error) {
      setMessage({ text: error.message, type: 'error' })
    } else {
      setMessage({ text: 'Profile updated successfully!', type: 'success' })
      setIsEditing(false)
      router.refresh()
    }
    setIsSaving(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const file = e.target.files[0]
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}-${Math.random()}.${fileExt}`

    setIsSaving(true)
    setMessage({ text: 'Uploading avatar...', type: 'info' })

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setMessage({ text: `Upload failed: ${uploadError.message}`, type: 'error' })
      setIsSaving(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
    
    setAvatarUrl(publicUrl)
    setMessage({ text: 'Avatar uploaded! Please save changes.', type: 'info' })
    setIsSaving(false)
  }

  return (
    <>
      <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-7 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-[#0f172a] text-[18px]">Personal Information</h3>
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Edit Profile
          </button>
        </div>
        
        {/* Read-Only View */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-gray-700 to-black overflow-hidden shadow-sm shrink-0 border border-gray-200">
               <img src={currentAvatar} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[16px] font-bold text-gray-900">{user.user_metadata?.full_name || 'No Name Set'}</span>
              <span className="text-[14px] font-medium text-gray-500">{user.user_metadata?.nickname ? `a.k.a ${user.user_metadata.nickname}` : 'No Nickname Set'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-semibold text-gray-400 tracking-wide uppercase">Email Address</span>
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-medium text-gray-900">{user.email}</span>
                {user.email_confirmed_at ? (
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 ring-1 ring-inset ring-green-600/20">VERIFIED</span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-0.5 text-[10px] font-bold text-yellow-800 ring-1 ring-inset ring-yellow-600/20">UNVERIFIED</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[500px] rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[20px] font-bold text-gray-900">Edit Profile</h2>
              <button 
                onClick={() => {
                  setIsEditing(false)
                  setMessage({text: '', type: ''})
                }} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-5">
                <div className="h-[72px] w-[72px] rounded-full overflow-hidden shadow-sm shrink-0 border border-gray-200">
                  <img src={avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-blue-50 px-4 py-2 text-[13px] font-semibold text-blue-700 hover:bg-blue-100 transition-colors w-fit">
                    Upload New Picture
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isSaving} />
                  </label>
                  <span className="text-[12px] text-gray-500">Max 2MB. Square image recommended.</span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-semibold text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-[14px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-semibold text-gray-700">Nickname</label>
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. Johnny"
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-[14px] text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {message.text && (
                <div className={`p-3 rounded-lg text-[13px] font-medium ${
                  message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 
                  message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                  'bg-green-50 text-green-700 border border-green-100'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-lg px-5 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
