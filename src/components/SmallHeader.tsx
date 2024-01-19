import { CreatorProfile } from '@/lib/types.ts'
import { Menu } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ModeToggle } from './mode-toggle.tsx'
import TapMotion from './TapMotion.tsx'

import store from '@/Redux/store.ts'

export default function SmallHeader({ setShow }: { setShow: React.Dispatch<React.SetStateAction<boolean>> }) {
  const navigate = useNavigate()
  const creatorProfile: CreatorProfile = useSelector((state: ReturnType<typeof store.getState>) => state.profile)
  return (
    <div className='flex w-full items-center justify-between p-3.5 xl:px-8'>
      <div>
        <Menu className='h-7 w-7 xl:hidden' onClick={() => setShow(true)} />
      </div>
      <div className='flex gap-3.5'>
        <ModeToggle />
        <TapMotion size='md'>
          <img
            src={creatorProfile?.channel_logo}
            className='aspect-square h-9 w-9 cursor-pointer rounded-full'
            onClick={() => navigate('/edit_profile')}
          />
        </TapMotion>
      </div>
    </div>
  )
}
