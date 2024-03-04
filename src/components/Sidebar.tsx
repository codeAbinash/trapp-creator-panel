import { useSelector } from 'react-redux'
import { NavigateFunction, useLocation, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'

import { AreaChart, BarChartBigIcon, LogOut, LucideIcon, RadioIcon, UploadIcon, VideoIcon, ListVideoIcon } from 'lucide-react'

import store from '@/Redux/store'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { DEFAULT_PP } from '@/constants'
import ls from '@/lib/ls'
import transitions from '@/lib/transition'
import { CreatorProfile } from '@/lib/types'

export function LogoutPopupButton() {
  const navigate = useNavigate()
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className='halka-bg w-full text-neutral-800 hover:text-white dark:text-neutral-200'>
          Log Out <LogOut className='h-4 pl-2' />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to log out?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              ls.clear()
              navigate('/', { replace: true })
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function CreatorCard() {
  const navigate = useNavigate()
  const creatorProfile: CreatorProfile = useSelector((state: ReturnType<typeof store.getState>) => state.profile)
  return (
    <div className='halka-bg tap97 flex w-full cursor-pointer items-center gap-4 rounded-xl p-4 px-5' onClick={() => navigate('/edit_profile')}>
      <img src={creatorProfile?.channel_logo ?? DEFAULT_PP} className='h-10 w-10 rounded-full' />
      <p className='text-sm font-semibold'>{creatorProfile?.first_name + ' ' + creatorProfile?.last_name || 'Loading...'}</p>
    </div>
  )
}

export default function Sidebar({ show, setShow }: { show: boolean; setShow: React.Dispatch<React.SetStateAction<boolean>> }) {
  const navigate = useNavigate()
  const location = useLocation()
  // console.log(location.pathname)
  return (
    <>
      <div
        className={`fixed left-0 top-0 z-10 h-full w-full bg-black bg-opacity-50 backdrop-blur-sm ${show ? 'block xl:hidden' : 'hidden'}`}
        onClick={() => setShow(false)}
      ></div>
      <div
        className={`${show ? 'translate-x-0' : '-translate-x-full xl:-translate-x-0'} xl:transparent
        fixed left-0 top-0 z-20 h-full w-72 transform overflow-x-hidden border border-dashed border-transparent
        border-r-slate-500/20 bg-white transition-transform duration-300
        ease-in-out dark:bg-black xl:bg-transparent xl:dark:bg-transparent`}
      >
        <div className='flex h-full flex-col justify-between gap-3 p-5' onClick={() => setShow(false)}>
          <div className='flex flex-col gap-5'>
            <img src='AppIcons/full.svg' className='w-24 p-3' />
            <CreatorCard />
            <Options path={location.pathname} navigate={navigate} />
          </div>
          <div className='flex flex-col gap-2'>
            <LogoutPopupButton />
          </div>
        </div>
      </div>
    </>
  )
}

function Options({ path, navigate }: { path: string; navigate: NavigateFunction }) {
  return (
    <div className='flex flex-col gap-2'>
      <OptionItem navigate={navigate} path='/' currentPath={path} name='Dashboard' SideIcon={BarChartBigIcon} />
      <OptionItem navigate={navigate} path='/videos' currentPath={path} name='Videos' SideIcon={VideoIcon} />
      <OptionItem navigate={navigate} path='/videos/upload' currentPath={path} name='Upload Video' SideIcon={UploadIcon} />
      <OptionItem navigate={navigate} path='/videos/create_live' currentPath={path} name='Go Live' SideIcon={RadioIcon} />
      <OptionItem navigate={navigate} path='/videos/playlist' currentPath={path} name='Playlist' SideIcon={ListVideoIcon} />
    </div>
  )
}

function OptionItem({
  path,
  currentPath,
  name,
  SideIcon = AreaChart,
  navigate,
}: {
  path: string
  currentPath: string
  name: string
  SideIcon?: LucideIcon
  navigate: NavigateFunction
}) {
  return (
    <button
      onClick={transitions(() => navigate(path))}
      className={`flex items-center gap-3 rounded-md text-left ${path === currentPath ? 'bg-main bg-opacity-10' : 'halka-bg-hover'}`}
    >
      <div
        className={`flex items-center justify-between gap-3 p-3 px-4 text-sm font-medium ${
          path === currentPath ? 'text-main' : 'text-neutral-700 dark:text-neutral-300'
        } `}
      >
        <SideIcon className='h-[1.35rem]' />
        <span>{name || ''}</span>
      </div>
    </button>
  )
}
