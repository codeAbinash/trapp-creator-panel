import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { VIDEO_DESCRIPTION_LENGTH, VIDEO_TITLE_LENGTH } from '@/config'
import { PopupAlertType, usePopupAlertContext } from '@/context/PopupAlertContext'
import Chunk from '@/lib/Chunk'
import API, { get_cat_list_f } from '@/lib/api'
import { userMessage } from '@/lib/types'
import { picFileValidation, videoFileValidation } from '@/lib/utils'
import { CheckCircle, Image, Lock, UploadIcon, Video } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'

const successFn = (setIsUploading: React.Dispatch<React.SetStateAction<boolean>>, newPopup: (p: PopupAlertType) => void, nav: NavigateFunction) => {
  setIsUploading(false)
  newPopup({
    title: 'Success',
    subTitle: 'Video Uploaded Successfully',
    action: [
      {
        text: 'View Video',
        onClick: () => {
          nav('/videos')
        },
      },
      {
        text: 'Go Back',
        onClick: () => {
          nav(-1)
        },
      },
    ],
  })
}

const errorFn = (setIsUploading: React.Dispatch<React.SetStateAction<boolean>>, newPopup: (p: PopupAlertType) => void) => {
  setIsUploading(false)
  newPopup({ title: 'Error', subTitle: 'Video Upload Failed' })
}

const uploadProgressFn = (percent: number, setPercent: React.Dispatch<React.SetStateAction<number>>) => {
  console.log(percent.toFixed(2))
  setPercent(percent)
}

const upload = (
  file: File,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>,
  setPercent: React.Dispatch<React.SetStateAction<number>>,
  newPopup: (p: PopupAlertType) => void,
  nav: NavigateFunction,
  title: string = '',
  description: string = '',
  privacy: 'public' | 'private' = 'public',
  thumbnail: File,
  cat_id: string = '',
) => {
  setIsUploading(true)
  if (file) {
    const chunk = new Chunk({
      name: 'video', // request name
      size: 900000, // chunk size
      url: API.videos.upload, // destination
      title,
      description,
      privacy,
      cat_id,
      successFn: () => successFn(setIsUploading, newPopup, nav),
      errorFn: () => errorFn(setIsUploading, newPopup),
      updateProgressFn: (percent: number) => uploadProgressFn(percent, setPercent),
    })
    chunk.setFile(file)
    chunk.setThumbnail(thumbnail)
    chunk.commit()
  } else {
    console.warn('Please select a file.')
  }
}

export interface Category {
  id: number
  image: string
  title: string
  created_at: string
  updated_at: string
}

export default function Upload() {
  const thumbnailFile = useRef<HTMLInputElement>(null)
  const videFile = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [percent, setPercent] = useState(0)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public')
  const [cat_id, setCat_id] = useState('')
  const [categories, setCategories] = useState<Category[] | null>(null)

  const { newPopup } = usePopupAlertContext()
  const navigate = useNavigate()

  function uploadFile() {
    if (!videFile.current?.files?.[0]) return newPopup({ title: 'Invalid File', subTitle: 'Please select a Video to upload' })
    if (title.length > VIDEO_TITLE_LENGTH)
      return newPopup({ title: 'Invalid Title', subTitle: `Title can't be more than ${VIDEO_TITLE_LENGTH} characters long` })
    if (title.length < 5) return newPopup({ title: 'Invalid Title', subTitle: 'Title must be at least 5 characters long' })
    if (description.length > VIDEO_DESCRIPTION_LENGTH)
      return newPopup({ title: 'Invalid Description', subTitle: `Description can't be more than ${VIDEO_DESCRIPTION_LENGTH} characters long` })
    if (!thumbnailFile.current?.files?.[0]) return newPopup({ title: 'Invalid Thumbnail', subTitle: 'Please select a thumbnail' })

    if (!cat_id) return newPopup({ title: 'Invalid Category', subTitle: 'Please select a category' })

    upload(
      videFile.current!.files![0],
      setIsUploading,
      setPercent,
      newPopup,
      navigate,
      title,
      description,
      privacy,
      thumbnailFile.current!.files![0],
      cat_id,
    )
  }

  async function loadCategories() {
    const res = await get_cat_list_f()
    console.log(res.data)
    setCategories(res.data.data)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  return (
    <div className='pb-10'>
      <p className='text-2xl font-bold'>Upload Video 🎥 </p>

      <div className='flex flex-wrap gap-5'>
        <div className='halka-border mt-5 w-full max-w-[450px] rounded-xl shadow-black/5'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex w-full flex-col items-center justify-center gap-3 text-center text-xl'>
              <div>Video Files</div>
            </CardTitle>
            <CardDescription className='flex flex-col gap-3 font-medium'></CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            <ThumbnailUI thumbnailFile={thumbnailFile} isUploading={isUploading} />
            <VideoUI videoFile={videFile} isUploading={isUploading} percent={percent} />
          </CardContent>
          {/* <CardFooter className='flex-col'></CardFooter> */}
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
              <Label htmlFor='title'>
                Title{' '}
                <span className='text-xs font-normal opacity-50'>
                  ({title.length}/{VIDEO_TITLE_LENGTH})
                </span>
              </Label>
              <Textarea
                id='title'
                placeholder='Video Title'
                rows={2}
                disabled={isUploading}
                className='halka-border text-base'
                value={title}
                maxLength={VIDEO_TITLE_LENGTH}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='description'>
                Video Description{' '}
                <span className='text-xs font-normal opacity-50'>
                  ({description.length}/{VIDEO_DESCRIPTION_LENGTH})
                </span>
              </Label>
              <Textarea
                placeholder='Video Description'
                rows={10}
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
              <Label htmlFor='privacy'>Categories</Label>
              <Select value={cat_id} disabled={isUploading} onValueChange={(e) => setCat_id(e)}>
                <SelectTrigger className='halka-border w-full'>
                  <SelectValue placeholder={categories == null ? 'Loading...' : 'Select Category'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{categories == null ? 'Loading...' : 'Select Category'}</SelectLabel>
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
              <UploadIcon width={16} height={16} className='mr-2' />
              {isUploading ? `Uploading Video` : 'Upload Video'}
            </Button>
          </CardFooter>
        </div>
      </div>
    </div>
  )
}

function ThumbnailUI({ thumbnailFile, isUploading }: { thumbnailFile: React.MutableRefObject<HTMLInputElement | null>; isUploading: boolean }) {
  const { newPopup } = usePopupAlertContext()
  const [thumbnail, setThumbnail] = useState<null | string>(null)

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

function VideoUI({
  videoFile,
  isUploading,
  percent,
}: {
  videoFile: React.MutableRefObject<HTMLInputElement | null>
  isUploading: boolean
  percent: number
}) {
  const { newPopup } = usePopupAlertContext()
  const [video, setVideo] = useState<null | string>(null)

  const onChangeVideo = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileInput = e.target.files
      const ppValidation = videoFileValidation(fileInput![0])
      if (ppValidation.error) {
        newPopup({ title: 'Invalid File', subTitle: ppValidation.message })
        setVideo(null)
        return
      }
      setVideo(fileInput![0].name)
    },
    [setVideo, newPopup],
  )
  return (
    <>
      <input type='file' ref={videoFile} accept='video/mp4, video/mkv, video/avi' onChange={onChangeVideo} hidden disabled={isUploading} />
      <div onClick={() => videoFile.current?.click()} className='cursor-pointer transition-opacity active:opacity-80'>
        <div className='halka-bg flex aspect-[2/1] flex-col items-center justify-center gap-6 rounded-xl border p-5'>
          <Video className='h-7 w-7' />
          {video ? (
            <div className={`w-full text-center ${isUploading ? 'text-xs' : 'text-sm'}  font-semibold`}>{video}</div>
          ) : (
            <span className='font-semibold'>Select Video</span>
          )}
          {isUploading && (
            <div className='flex w-full flex-col gap-3'>
              <div className='relative h-1.5 w-full overflow-hidden rounded-lg bg-black/20 dark:bg-white/20'>
                <div className='absolute left-0 top-0 h-full rounded-full bg-main' style={{ width: `${percent}%` }}></div>
              </div>
              <p className='mt-2 text-center text-xs font-semibold'>{percent.toFixed(2)}% Uploaded</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
