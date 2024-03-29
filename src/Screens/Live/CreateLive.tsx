import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { VIDEO_DESCRIPTION_LENGTH, VIDEO_TITLE_LENGTH } from '@/config'
import { usePopupAlertContext } from '@/context/PopupAlertContext'
import { create_live_f, edit_video_f } from '@/lib/api'
import { picFileValidation } from '@/lib/utils'
import { CheckCircle, Image, Lock, RadioIcon } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export default function CreateLive() {
  const { state } = useLocation()
  const thumbnailFile = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState(state?.title || '')
  const [description, setDescription] = useState(state?.description || '')
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public')

  const { newPopup } = usePopupAlertContext()

  const navigate = useNavigate()

  async function uploadFile() {
    if (title.length > VIDEO_TITLE_LENGTH)
      return newPopup({ title: 'Invalid Title', subTitle: `Title can't be more than ${VIDEO_TITLE_LENGTH} characters long` })
    if (title.length < 5) return newPopup({ title: 'Invalid Title', subTitle: 'Title must be at least 5 characters long' })
    if (description.length > VIDEO_DESCRIPTION_LENGTH)
      return newPopup({ title: 'Invalid Description', subTitle: `Description can't be more than ${VIDEO_DESCRIPTION_LENGTH} characters long` })

    if (thumbnailFile.current?.files?.[0]) {
      const thumbValidation = picFileValidation(thumbnailFile.current.files![0])
      if (thumbValidation.error) {
        newPopup({ title: 'Invalid Thumbnail', subTitle: thumbValidation.message })
        return
      }
    }

    const formData = new FormData()
    if (title) formData.append('title', title)
    if (privacy) formData.append('privacy', privacy)
    if (description) formData.append('description', description)
    if (thumbnailFile.current?.files?.[0]) formData.append('thumbnail', thumbnailFile.current.files![0])
    setIsUploading(true)

    const res = await create_live_f(formData)
    if (!res.status) newPopup({ title: 'Error', subTitle: res.message })
    else {
      const vid_id = res.data.data.vid_id
      navigate(`/videos/live`, { state: { vid_id, title, description, privacy } })
    }
    console.log(res.data)
    setIsUploading(false)
  }

  return (
    <div className='pb-10'>
      <p className='text-2xl font-bold'>
        Go Live <RadioIcon height={35} width={35} className='ml-2 inline-block text-main' />
      </p>

      <div className='flex flex-wrap gap-5'>
        <div className='halka-border mt-5 w-full max-w-[450px] rounded-xl shadow-black/5'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex w-full flex-col items-center justify-center gap-3 text-center text-xl'>
              <div>Video Files</div>
            </CardTitle>
            <CardDescription className='flex flex-col gap-3 font-medium'></CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            <ThumbnailUI thumbnailFile={thumbnailFile} isUploading={isUploading} thumbnail={state?.thumbnail || null} />
            <div className='space-y-2'>
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
        </div>
        <div className='halka-border mt-5 w-full max-w-[450px] rounded-xl shadow-black/5'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex w-full flex-col items-center justify-center gap-3 text-center text-xl'>
              <div>Video Description</div>
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
          <CardFooter className='flex-col'>
            <Button className='w-full' onClick={uploadFile} disabled={isUploading}>
              {isUploading ? (
                <>
                  <img src='/icons/other/loading.svg' className='mr-2 aspect-square h-5 invert' />
                  Starting Live Stream
                </>
              ) : (
                <>
                  <RadioIcon height={20} width={20} className='mr-2' />
                  Start Live Stream
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
