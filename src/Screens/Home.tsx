import { setProfile, setProfileInfoLs } from '@/Redux/profile'
import store from '@/Redux/store'
import Sidebar from '@/components/Sidebar'
import SmallHeader from '@/components/SmallHeader'
import { get_profile_f } from '@/lib/api'
import ls from '@/lib/ls'
import { CreatorProfile } from '@/lib/types'
import { useCallback, useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()

  // const loadProfile = useCallback(async () => {
  //   const res = await get_profile_f()
  //   if (!res.status) return
  //   const profile = res?.data.data as CreatorProfile
  //   store.dispatch(setProfile(profile))
  //   setProfileInfoLs(profile)
  // }, [])

  // useEffect(() => {
  //   loadProfile()
  // }, [loadProfile])
  // useEffect(() => {
  //   if (!ls.get('token')) navigate('/login')
  // })
  return (
    <div className='gradient'>
      <Sidebar show={isSidebarOpen} setShow={setIsSidebarOpen} />
      <div className='min-h-[100dvh] w-full translate-x-0 xl:w-[calc(100%-18rem)] xl:translate-x-72'>
        <SmallHeader setShow={setIsSidebarOpen} />
        <div className='px-5 xl:px-10'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
