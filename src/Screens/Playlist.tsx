import { Loading } from '@/components/Loading'
import TapMotion from '@/components/TapMotion'
import { PopupAlertType, usePopupAlertContext } from '@/context/PopupAlertContext'
import { create_playlist_f, delete_playlist_f, fetch_playlist_f } from '@/lib/api'
import { KB } from '@/lib/constants'
import transitions from '@/lib/transition'
import { picFileValidation } from '@/lib/utils'
import { CheckIcon, ImageIcon, ImagePlus, Trash2Icon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Playlist } from './Videos/types'

export default function Categories() {
  const [categories, setCategories] = useState<Playlist[] | null>(null)

  async function loadAllCategories() {
    setCategories(null)
    const res = await fetch_playlist_f()
    if (res.status) setCategories(res.data.data)
    console.log(res)
  }

  useEffect(() => {
    loadAllCategories()
  }, [])

  return (
    <div>
      <p className='mb-5 text-2xl font-bold'>Playlist</p>
      <div className='mt-5 flex w-full flex-wrap gap-5 xl:grid-cols-2'>
        <AddNewPlaylist loadAllCategories={loadAllCategories} />
        {categories == null ? (
          <>
            <PlaylistShimmer />
            <PlaylistShimmer />
            <PlaylistShimmer />
            <PlaylistShimmer />
            <PlaylistShimmer />
            <PlaylistShimmer />
            <PlaylistShimmer />
            <PlaylistShimmer />
          </>
        ) : null}

        {categories?.map((playlist) => <Playlist key={playlist.id} playlist={playlist} loadAllCategories={loadAllCategories} />)}
      </div>
    </div>
  )
}

function AddNewPlaylist({ loadAllCategories }: { loadAllCategories: () => Promise<void> }) {
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { newPopup } = usePopupAlertContext()
  const pic = useRef<HTMLInputElement>(null)
  const [picPreviewUrl, setPicPreviewUrl] = useState<string | null>(null)

  const onChangeFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileInput = e.target.files
      const ppValidation = picFileValidation(pic.current!.files![0], 512 * KB)
      if (ppValidation.error) {
        newPopup({ title: 'Invalid File', subTitle: ppValidation.message })
        pic.current!.value = ''
        return
      }
      if (!fileInput?.length) return
      setPicPreviewUrl(URL.createObjectURL(fileInput![0]))
    },
    [newPopup],
  )

  async function addPlaylist() {
    if (!title.trim()) return newPopup({ title: 'Invalid Title', subTitle: 'Title cannot be empty' })
    if (!pic.current?.files![0]) return newPopup({ title: 'Invalid Image', subTitle: 'Image cannot be empty' })

    setIsLoading(true)

    const body = {} as any
    body.name = title.trim()
    body.thumbnail = pic.current?.files![0]!

    const formData = new FormData()
    for (const key in body) formData.append(key, body[key]!)

    const res = await create_playlist_f(formData)
    console.log(res)
    if (res.status) {
      await loadAllCategories()
      setTitle('')
      setPicPreviewUrl(null)
    }
    setIsLoading(false)
  }

  return (
    <div className='halka-bg flex w-full max-w-sm items-center gap-4 rounded-xl p-3'>
      {picPreviewUrl ? (
        <TapMotion size='lg' onClick={() => pic.current?.click()}>
          <img className='mr-5 h-16 w-16 cursor-pointer rounded-lg' src={picPreviewUrl} alt={title} />
        </TapMotion>
      ) : (
        <TapMotion
          onClick={() => pic.current?.click()}
          size='lg'
          className='halka-bg flex h-16 w-16 flex-none cursor-pointer items-center justify-center rounded-lg'
        >
          <ImagePlus className='h-5 w-5 rounded-lg opacity-80' />
        </TapMotion>
      )}

      <input type='file' hidden ref={pic} onChange={onChangeFileSelect} />

      <div className='flex w-full justify-between gap-4'>
        <input
          className='halka-bg w-full border border-transparent border-b-red-500 bg-transparent px-2 outline-none'
          placeholder='Playlist Name'
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className='flex flex-row gap-3'>
          {isLoading ? (
            <div className='tap99 rounded-full py-2.5'>
              <Loading />
            </div>
          ) : (
            <TapMotion size='md' className='tap99 rounded-full bg-green-500/20 p-2.5 text-green-500' onClick={addPlaylist}>
              <CheckIcon className='h-4 w-4' strokeWidth={3} />
            </TapMotion>
          )}
        </div>
      </div>
    </div>
  )
}

async function deletePlaylist(playlist: Playlist, newPopup: (popup: PopupAlertType) => void, loadAllCategories: () => Promise<void>) {
  transitions(() =>
    newPopup({
      title: 'Delete Playlist',
      subTitle: 'Are you sure you want to delete this Playlist?',
      action: [
        {
          text: <span className='text-red-500'>Delete</span>,
          onClick: async () => {
            setTimeout(async () => {
              newPopup({
                title: (
                  <span className='flex'>
                    <Loading />
                    Deleting Playlist
                  </span>
                ),
                subTitle: 'Please wait while we delete your playlist',
                action: [],
              })

              const res = await delete_playlist_f(playlist.id)
              if (res.status) {
                newPopup({
                  title: 'Playlist Deleted',
                  subTitle: 'Your playlist has been deleted successfully',
                })
                loadAllCategories()
              } else {
                newPopup({
                  title: 'Error',
                  subTitle: 'Something went wrong while deleting your playlist',
                })
                loadAllCategories()
              }
            }, 100)
          },
        },
        { text: <span className='text-green-500'>Cancel</span> },
      ],
    }),
  )()
}

function Playlist({ playlist, loadAllCategories }: { playlist: Playlist; loadAllCategories: () => Promise<void> }) {
  const [edit, setEdit] = useState(false)
  const [title, setTitle] = useState(playlist.playlist_name)
  const [isLoading, setIsLoading] = useState(false)

  const { newPopup } = usePopupAlertContext()

  async function updatePlaylist() {
    // setIsLoading(true)
    // const res = await edit_playlist_f(playlist.id, title)
    // if (res.status) setEdit(false)
    // else setTitle(playlist.title)
    // setIsLoading(false)
  }

  return (
    <div className='halka-bg flex w-full max-w-sm items-center rounded-xl p-3'>
      <img className='mr-5 h-16 w-16 rounded-lg' src={playlist.thumbnail} alt={title} />
      <div className='flex w-full justify-between gap-4'>
        {edit ? (
          <input
            className='halka-bg w-full border border-transparent border-b-red-500 bg-transparent px-2 outline-none'
            placeholder='Playlist Name'
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <p className='line-clamp-1 text-lg font-medium'>{title}</p>
        )}
        <div className='flex flex-row gap-3'>
          {edit ? (
            isLoading ? (
              <div className='tap99 rounded-full py-2.5'>
                <Loading />
              </div>
            ) : (
              <TapMotion size='md' className='tap99 rounded-full bg-green-500/20 p-2.5 text-green-500' onClick={updatePlaylist}>
                <CheckIcon className='h-4 w-4' strokeWidth={3} />
              </TapMotion>
            )
          ) : (
            <>
              {/* <TapMotion size='md' className='tap99 rounded-full bg-green-500/20 p-2.5 text-green-500' onClick={() => setEdit(true)}> */}
              {/* <PencilIcon className='h-4 w-4' /> */}
              {/* </TapMotion> */}

              <TapMotion
                size='md'
                className='tap99 rounded-full bg-red-500/20 p-2.5 text-red-500'
                onClick={() => deletePlaylist(playlist, newPopup, loadAllCategories)}
              >
                <Trash2Icon className='h-4 w-4' />
              </TapMotion>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PlaylistShimmer() {
  return (
    <div className='halka-bg shimmer flex w-full max-w-sm items-center gap-4 rounded-xl p-3'>
      <TapMotion size='lg' className='halka-bg flex h-16 w-16 flex-none cursor-pointer items-center justify-center rounded-lg'>
        <ImageIcon className='h-5 w-5 rounded-lg opacity-80' />
      </TapMotion>
      <div className='flex w-full justify-between gap-3'>
        <div className='halka-bg halka-bg w-full rounded-sm border px-2 outline-none' />
        <div className='flex flex-row gap-3'>
          <div className='tap99 rounded-full py-2.5' />
          <div className='tap99 halka-bg rounded-full bg-green-500/20 p-3' />
          <div className='tap99 halka-bg rounded-full bg-red-500/20 p-3' />
        </div>
      </div>
    </div>
  )
}
