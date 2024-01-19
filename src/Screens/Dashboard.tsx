import { get_counts_f } from '@/lib/api'
import { DashboardCounts } from '@/lib/types'
import { increaseCount } from '@/lib/utils'
import { useCallback, useEffect, useState } from 'react'

function Dashboard() {
  return <Cards />
}

function Cards() {
  const [countFollowers, setCountFollowers] = useState(0)
  const [countLive, setCountLive] = useState(0)
  const [countVideos, setCountVideos] = useState(0)
  const [countRevenue, setCountRevenue] = useState(0)

  const loadCounts = useCallback(async () => {
    const res = await get_counts_f()
    if (!res.status) return
    const data: DashboardCounts = res.data.dash_counts
    // increaseCount(data?.followers || 0, setCountFollowers)
    // increaseCount(data?.live || 0, setCountLive)
    // increaseCount(data?.revenue || 0, setCountRevenue)
    // increaseCount(data?.videos || 0, setCountVideos)
    setCountFollowers(data?.followers || 0)
    setCountLive(data?.live || 0)
    setCountRevenue(data?.revenue || 0)
    setCountVideos(data?.videos || 0)
  }, [setCountFollowers, setCountLive, setCountRevenue, setCountVideos])

  useEffect(() => {
    loadCounts()
  }, [loadCounts])

  return (
    <div className='space-y-4 px-2'>
      <div>
        <p className='text-2xl font-bold'>Hello Creator 👋</p>
      </div>
      <div className='flex flex-wrap gap-5  pt-5'>
        <CardCount icon='https://minimal-kit-react.vercel.app/assets/icons/glass/ic_glass_users.png' count={countFollowers} title='Total Followers' />
        <CardCount icon='https://minimal-kit-react.vercel.app/assets/icons/glass/ic_glass_buy.png' count={countVideos} title='Total Videos' />
        <CardCount icon='https://minimal-kit-react.vercel.app/assets/icons/glass/ic_glass_message.png' count={countLive} title='Total Live' />
        <CardCount icon='https://minimal-kit-react.vercel.app/assets/icons/glass/ic_glass_bag.png' count={countRevenue} title='Total Revenue' />
      </div>
      <div>{/* <img src='./AppIcons/square.svg' alt='' /> */}</div>
    </div>
  )
}
function CardCount({ count = 0, title = 'text', icon = '' }: { count?: number; title?: string; icon?: string }) {
  return (
    <div className='halka-bg flex h-28 w-[100%] items-center gap-4 rounded-2xl p-5 sm:w-[48%] lg:w-[23%] '>
      <div>
        <img src={icon} alt='' className='h-16' />
      </div>
      <div>
        <div className='text-2xl font-semibold'>{count}</div>
        <div className='text-sm font-medium opacity-70'>{title}</div>
      </div>
    </div>
  )
}

export default Dashboard
