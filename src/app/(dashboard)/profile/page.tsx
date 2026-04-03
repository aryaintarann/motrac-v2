import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileTabs } from '@/components/ProfileTabs'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-[-0.02em]">Profile Settings</h1>
        <p className="text-[14px] text-gray-500 mt-1">Manage your account information and preferences.</p>
      </div>

      <ProfileTabs initialUser={user} />
    </div>
  )
}
