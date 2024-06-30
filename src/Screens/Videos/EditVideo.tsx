import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { VIDEO_DESCRIPTION_LENGTH, VIDEO_TITLE_LENGTH } from '@/config'
import { PopupAlertType, usePopupAlertContext } from '@/context/PopupAlertContext'
import { edit_video_f, fetch_playlist_f, get_cat_list_f } from '@/lib/api'
import { picFileValidation } from '@/lib/utils'
import { CheckCircle, Image, Lock, UploadIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Category, Playlist } from './types'

const errorFn = (setIsUploading: React.Dispatch<React.SetStateAction<boolean>>, newPopup: (p: PopupAlertType) => void) => {
  setIsUploading(false)
  newPopup({ title: 'Error', subTitle: 'Video Failed to Update' })
}

export default function EditVideo() {
  // Use react router passes data
  const { state } = useLocation()
  const thumbnailFile = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState(state?.title || '')
  const [description, setDescription] = useState(state?.description || '')
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public')
  const [cat_id, setCat_id] = useState(state?.cat_id || '')
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [pl_id, setPl_id] = useState(state?.playlist_id || '')
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null)

  async function loadCategories() {
    const res = await get_cat_list_f()
    console.log(res.data)
    setCategories(res.data.data)
  }

  async function loadPlaylists() {
    const res = await fetch_playlist_f()
    console.log(res.data)
    setPlaylists(res.data.data)
  }

  useEffect(() => {
    loadCategories()
    loadPlaylists()
    console.log(state)
  }, [state])

  const { newPopup } = usePopupAlertContext()
  //   const navigate = useNavigate()

  async function uploadFile() {
    //  if (!videFile.current?.files?.[0]) return newPopup({ title: 'Invalid File', subTitle: 'Please select a Video to upload' })
    if (title.length > VIDEO_TITLE_LENGTH)
      return newPopup({ title: 'Invalid Title', subTitle: `Title can't be more than ${VIDEO_TITLE_LENGTH} characters long` })
    if (title.length < 5) return newPopup({ title: 'Invalid Title', subTitle: 'Title must be at least 5 characters long' })
    if (description.length > VIDEO_DESCRIPTION_LENGTH)
      return newPopup({ title: 'Invalid Description', subTitle: `Description can't be more than ${VIDEO_DESCRIPTION_LENGTH} characters long` })

    // if (!thumbnailFile.current?.files?.[0]) return newPopup({ title: 'Invalid Thumbnail', subTitle: 'Please select a thumbnail' })

    if (thumbnailFile.current?.files?.[0]) {
      const thumbValidation = picFileValidation(thumbnailFile.current.files![0])
      if (thumbValidation.error) {
        newPopup({ title: 'Invalid Thumbnail', subTitle: thumbValidation.message })
        return
      }
    }
    const formData = new FormData()
    if (thumbnailFile.current?.files?.[0]) formData.append('thumbnail', thumbnailFile.current.files![0])
    if (title) formData.append('title', title)
    if (description) formData.append('description', description)
    if (privacy) formData.append('privacy', privacy)
    if (cat_id) formData.append('cat_id', cat_id)
    if (pl_id) formData.append('playlist_id', pl_id)
    formData.append('id', state.id)
    setIsUploading(true)

    const res = await edit_video_f(formData)
    if (!res.status) newPopup({ title: 'Error', subTitle: res.message })
    else newPopup({ title: 'Success', subTitle: res.message })
    setIsUploading(false)
  }

  return (
    <div className='pb-10'>
      <p className='text-2xl font-bold'>Edit Video 🎥 </p>

      <div className='flex flex-wrap gap-5'>
        <div className='halka-border mt-5 w-full max-w-[450px] rounded-xl shadow-black/5'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex w-full flex-col items-center justify-center gap-3 text-center text-xl'>
              <div>Thumbnail</div>
            </CardTitle>
            <CardDescription className='flex flex-col gap-3 font-medium'></CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            <ThumbnailUI thumbnailFile={thumbnailFile} isUploading={isUploading} thumbnail={state?.thumbnail || null} />
            <div className='mt-4 space-y-2'>
              <Label htmlFor='title'>
                Title{' '}
                <span className='text-xs font-normal opacity-50'>
                  ({title.length}/{VIDEO_TITLE_LENGTH})
                </span>
              </Label>
              <Input
                id='title'
                placeholder='Video Title'
                type='text'
                disabled={isUploading}
                value={title}
                maxLength={VIDEO_TITLE_LENGTH}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </CardContent>
        </div>
        <div className='halka-border mt-5 w-full max-w-[450px] rounded-xl shadow-black/5'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex w-full flex-col items-center justify-center gap-3 text-center text-xl'>
              <div>Video Information</div>
            </CardTitle>
            <CardDescription className='flex flex-col gap-3 font-medium'></CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='space-y-2'>
              <Label htmlFor='description'>
                Video Description{' '}
                <span className='text-xs font-normal opacity-50'>
                  ({description.length}/{VIDEO_DESCRIPTION_LENGTH})
                </span>
              </Label>
              <Textarea
                placeholder='Video Description'
                rows={11}
                id='description'
                className='halka-border text-base'
                disabled={isUploading}
                value={description}
                maxLength={VIDEO_DESCRIPTION_LENGTH}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </div>
        <div className='halka-border mt-5 w-full max-w-[450px] rounded-xl shadow-black/5'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex w-full flex-col items-center justify-center gap-3 text-center text-xl'>
              <div>Video Information</div>
            </CardTitle>
            <CardDescription className='flex flex-col gap-3 font-medium'></CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='space-y-2'>
              <Label htmlFor='category'>Categories</Label>
              <Select value={cat_id} disabled={isUploading} onValueChange={(e) => setCat_id(e)}>
                <SelectTrigger className='halka-border w-full'>
                  <SelectValue placeholder={categories == null ? 'Loading Categories...' : 'Select Category'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{categories == null ? 'Loading Categories...' : 'Select Category'}</SelectLabel>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        <div className='flex gap-3'>
                          <img src={cat.image} alt={cat.title} className='h-6 w-6 rounded-full' />
                          {cat.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='playlist'>Playlist</Label>
              <Select value={pl_id} disabled={isUploading} onValueChange={(e) => setPl_id(e)}>
                <SelectTrigger className='halka-border w-full'>
                  <SelectValue placeholder={playlists == null ? 'Loading Playlists...' : 'Select Playlist'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{playlists == null ? 'Loading Playlists..' : 'Select Playlist'}</SelectLabel>
                    {playlists?.map((playlist) => (
                      <SelectItem key={playlist.id} value={playlist.id.toString()}>
                        <div className='flex gap-3'>
                          <img src={playlist.thumbnail} alt={playlist.playlist_name} className='h-6 w-6 rounded-full' />
                          {playlist.playlist_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='privacy'>Privacy</Label>
              <Select value={privacy} disabled={isUploading} onValueChange={(e: 'public' | 'private') => setPrivacy(e)}>
                <SelectTrigger className='halka-border w-full'>
                  <SelectValue placeholder='Public' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Privacy</SelectLabel>
                    <SelectItem value='public'>
                      <div className='flex'>
                        <CheckCircle width={18} height={18} className='mr-2' />
                        Public
                      </div>
                    </SelectItem>
                    <SelectItem value='private'>
                      <div className='flex'>
                        <Lock width={18} height={16} className='mr-2' />
                        Private
                      </div>
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className='flex-col'>
            <Button className='w-full' onClick={uploadFile} disabled={isUploading}>
              {isUploading ? (
                <>
                  <img src='/icons/other/loading.svg' className='mr-2 aspect-square h-5 invert' />
                  Updating
                </>
              ) : (
                <>
                  <UploadIcon width={16} height={16} className='mr-2' />
                  Update
                </>
              )}
            </Button>
          </CardFooter>
        </div>
      </div>
    </div>
  )
}

function ThumbnailUI({
  thumbnailFile,
  isUploading,
  thumbnail: thumbnailURL,
}: {
  thumbnailFile: React.MutableRefObject<HTMLInputElement | null>
  isUploading: boolean
  thumbnail: string | null
}) {
  const { newPopup } = usePopupAlertContext()
  const [thumbnail, setThumbnail] = useState<null | string>(thumbnailURL)

  const onChangeThumbnail = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileInput = e.target.files
      const ppValidation = picFileValidation(fileInput![0])
      if (ppValidation.error) {
        newPopup({ title: 'Invalid File', subTitle: ppValidation.message })
        setThumbnail(null)
        return
      }
      fileInput![0] && setThumbnail(URL.createObjectURL(fileInput![0]))
    },
    [setThumbnail, newPopup],
  )
  return (
    <>
      <input type='file' ref={thumbnailFile} accept='image/png, image/jpeg, image/jpg' onChange={onChangeThumbnail} hidden disabled={isUploading} />
      <div onClick={() => thumbnailFile.current?.click()} className='cursor-pointer transition-opacity active:opacity-80'>
        {thumbnail ? (
          <img src={thumbnail} alt='Thumbnail' className='aspect-video rounded-xl object-cover' />
        ) : (
          <div className='halka-bg flex aspect-video flex-col items-center justify-center gap-5 rounded-xl border'>
            <Image className='h-7 w-7' />
            <span className='font-semibold'>Select Thumbnail</span>
          </div>
        )}
      </div>
    </>
  )
}
