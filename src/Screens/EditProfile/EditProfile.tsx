import { setProfile, setProfileInfoLs } from '@/Redux/profile'
import store from '@/Redux/store'
import { useSelector } from 'react-redux'

import { Loading } from '@/components/Loading'
import TapMotion from '@/components/TapMotion'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePopupAlertContext } from '@/context/PopupAlertContext'
import API, { authorizedHeader, formDataHeaders, getError, get_profile_f } from '@/lib/api'
import transitions from '@/lib/transition'
import { CreatorProfile, userMessage } from '@/lib/types'
import { delayFn, picFileValidation } from '@/lib/utils'
import { Pencil } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MB } from '@/lib/constants'

function ProfilePicture({
  imageUrl,
  onImageClick,
}: {
  imageUrl?: string
  onImageClick?: (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => void
}) {
  return (
    <div className='relative mx-auto mb-5 mt-2 w-full max-w-lg'>
      <TapMotion size='lg' className='mx-auto w-[35%]' onClick={onImageClick}>
        <img
          src={imageUrl}
          className='tap97 dashed-border profile-picture bg-inputBg mx-auto aspect-square w-full rounded-full border border-white/50 bg-white/10 object-cover shadow-xl'
        />
      </TapMotion>
      <TapMotion
        size='sm'
        onClick={onImageClick}
        className='tap95 anim-edit-icon edit-button absolute left-[55%] top-[75%] flex aspect-square h-11 w-11 items-center justify-center rounded-full bg-accent p-3 shadow-lg'
      >
        <Pencil className='w-10' />
        {/* <img src={icon('edit.svg')} className='invert' />0 */}
      </TapMotion>
    </div>
  )
}

function ChannelBanner({
  imageUrl,
  onImageClick,
}: {
  imageUrl?: string
  onImageClick?: (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => void
}) {
  return (
    <div className='absolute top-0 aspect-video w-full'>
      <div>
        <img src={imageUrl} className='aspect-video w-full rounded-xl object-cover' />
        <TapMotion
          size='sm'
          className='tap95 anim-edit-icon edit-button absolute bottom-5 right-5 flex aspect-square h-11 w-11 items-center justify-center rounded-full bg-accent p-3 shadow-lg'
          onClick={onImageClick}
        >
          <Pencil className='w-10' />
        </TapMotion>
      </div>
    </div>
  )
}
type creatorUpdate = {
  name?: string
  email?: string
  channel_logo?: File
  password?: string
}
async function updateLocalCreatorData() {
  const creatorProfileData = await get_profile_f()
  if (creatorProfileData.status) {
    setProfileInfoLs(creatorProfileData.data.data)
    store.dispatch(setProfile(creatorProfileData.data.data as CreatorProfile))
  }
}
export default function EditProfile() {
  const creatorProfile: CreatorProfile = useSelector((state: ReturnType<typeof store.getState>) => state.profile)
  const [first_name, setFirstName] = useState(creatorProfile?.first_name || '')
  const [last_name, setLastName] = useState(creatorProfile?.last_name || '')
  const [email, setEmail] = useState(creatorProfile?.email || '')
  const [pass1, setPass1] = useState('')
  const [pass2, setPass2] = useState('')
  const [channel_name, setChannelName] = useState(creatorProfile?.channel_name || 'Channel Name')
  const [isUpdating, setIsUpdating] = useState(false)
  const { newPopup } = usePopupAlertContext()
  const pp = useRef<HTMLInputElement>(null)
  const [profilePicture, setProfilePicture] = useState(creatorProfile?.channel_logo || '')
  const banner = useRef<HTMLInputElement>(null)
  const [bannerPicture, setBannerPicture] = useState(creatorProfile?.channel_banner || '/images/banner.avif')

  const onProfilePicChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileInput = e.target.files
      const ppValidation = picFileValidation(fileInput![0])
      if (ppValidation.error) return newPopup({ title: 'Invalid File', subTitle: ppValidation.message })
      setProfilePicture(fileInput![0] && URL.createObjectURL(fileInput![0]))
    },
    [setProfilePicture, newPopup],
  )

  const onBannerPicChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileInput = e.target.files
      const ppValidation = picFileValidation(fileInput![0])
      if (ppValidation.error) return newPopup({ title: 'Invalid File', subTitle: ppValidation.message })
      setBannerPicture(fileInput![0] && URL.createObjectURL(fileInput![0]))
    },
    [setBannerPicture, newPopup],
  )

  async function handelSubmit() {
    setIsUpdating(true)
    const validationError = validation(first_name, last_name, email, pass1, pass2)
    if (validationError.error) {
      newPopup({ title: 'Error', subTitle: validationError.message })
      setIsUpdating(false)
      return
    }

    const body: any = {} as creatorUpdate
    if (first_name) body.first_name = first_name.trim()
    if (channel_name) body.channel_name = channel_name.trim()
    if (last_name) body.last_name = last_name.trim()
    if (email) body.email = email.trim()
    if (pass1) body.password = pass1.trim()

    if (profilePicture !== creatorProfile?.channel_logo) {
      const ppValidation = picFileValidation(pp.current!.files![0], 2 * MB, '2MB')
      if (ppValidation.error) {
        newPopup({ title: 'Invalid File', subTitle: ppValidation.message })
        setIsUpdating(false)
        return
      }
      if (pp.current!.files![0]) body.channel_logo = pp.current!.files![0]
    }

    if (bannerPicture !== creatorProfile?.channel_banner) {
      const bannerValidation = picFileValidation(banner.current!.files![0], 2 * MB, '2MB')
      if (bannerValidation.error) {
        newPopup({ title: 'Invalid File', subTitle: bannerValidation.message })
        setIsUpdating(false)
        return
      }
      if (banner.current!.files![0]) body.channel_banner = banner.current!.files![0]
    }

    const formData = new FormData()
    for (const key in body) formData.append(key, body[key]!)

    const res = await fetch(API.creator.update_profile, {
      method: 'POST',
      headers: authorizedHeader(formDataHeaders),
      body: formData,
    })

    const data = await res.json()
    console.log(data)
    if (data.status) {
      await updateLocalCreatorData()
      setIsUpdating(false)
      newPopup({
        title: 'Profile Updated',
        subTitle: 'Your profile has been updated successfully.',
      })
    } else {
      setIsUpdating(false)
      newPopup({ title: 'Error', subTitle: getError(data.errors) })
    }
  }

  const loadProfile = useCallback(async () => {
    const res = await get_profile_f()
    if (!res.status) return
    const profileData = res.data.data as CreatorProfile
    // setName(profileData?.name || '')
    setEmail(profileData?.email || '')
    // setProfilePicture(profileData?.profile_pic || '')
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // useEffect(() => {
  //   console.log(channel_name)
  // }, [channel_name])

  if (!creatorProfile) return <Loading text='Loading Profile...' />

  return (
    <div>
      <input type='file' hidden ref={pp} onChange={onProfilePicChange} accept='image/png, image/jpeg, image/jpg' />
      <input type='file' hidden ref={banner} onChange={onBannerPicChange} accept='image/png, image/jpeg, image/jpg' />
      <p className='mb-5 text-2xl font-bold'>Edit Profile 🎨</p>
      {/* <div onClick={() => banner.current?.click()}>Hi</div> */}
      <div className='flex flex-wrap gap-5'>
        <div className='dashed-border relative w-full max-w-[450px] rounded-xl shadow-black/5'>
          <ChannelBanner imageUrl={bannerPicture} onImageClick={delayFn(() => banner.current?.showPicker())} />
          <CardHeader className='mt-[2rem] pb-1'>
            <CardTitle className='flex w-full flex-col items-center justify-center gap-3 text-center text-2xl'>
              <ProfilePicture imageUrl={profilePicture} onImageClick={delayFn(() => pp.current?.showPicker())} />
              <div className='pt-8 text-center text-2xl font-bold'>{channel_name || 'Channel Name'}</div>
            </CardTitle>
            <CardDescription className='text-balance pb-2 text-center font-medium'>
              Only Channel Name, Profile Picture and Banner Image will be visible to your audience
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <ChannelName channel_name={channel_name} setChannelName={setChannelName} />
            <Email email={email} setEmail={setEmail} />
          </CardContent>
        </div>
        <div className='dashed-border relative w-full max-w-[450px] rounded-xl shadow-black/5'>
          <CardHeader className='pb-1'>
            <CardTitle className='w-full text-center text-2xl'>Name and Password</CardTitle>
            <CardDescription className='text-balance text-center font-medium'>These details will not be visible to your audience</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <input type='file' className='hidden' ref={pp} onChange={onProfilePicChange} accept='image/png, image/jpeg, image/jpg' />
            <Names first_name={first_name} setFirstName={setFirstName} last_name={last_name} setLastName={setLastName} />
            <Password pass1={pass1} setPass1={setPass1} pass2={pass2} setPass2={setPass2} />
          </CardContent>
          <CardFooter className='flex-col'>
            <Button className='w-full' size='lg' onClick={handelSubmit} disabled={isUpdating}>
              {isUpdating ? <Loading text='Updating...' invert='invert' /> : 'Update Profile'}
            </Button>
          </CardFooter>
        </div>
      </div>
    </div>
  )
}

function Email({ email, setEmail }: { email: string; setEmail: React.Dispatch<React.SetStateAction<string>> }) {
  return (
    <div className='space-y-1'>
      <Label htmlFor='email'>Email</Label>
      <Input
        id='email'
        placeholder='Enter your email'
        onChange={(e) => {
          setEmail(e.target.value)
        }}
        value={email}
      />
    </div>
  )
}

function ChannelName({ channel_name, setChannelName }: { channel_name: string; setChannelName: React.Dispatch<React.SetStateAction<string>> }) {
  return (
    <div className='space-y-1'>
      <Label htmlFor='channel_name'>Channel Name</Label>
      <Input
        id='channel_name'
        placeholder='Enter your Channel name'
        onChange={(e) => {
          setChannelName(e.target.value)
        }}
        value={channel_name}
      />
    </div>
  )
}

function Names({
  first_name,
  setFirstName,
  last_name,
  setLastName,
}: {
  first_name: string
  setFirstName: React.Dispatch<React.SetStateAction<string>>
  last_name: string
  setLastName: React.Dispatch<React.SetStateAction<string>>
}) {
  return (
    <>
      <div className='space-y-1'>
        <Label htmlFor='first_name'>First Name</Label>
        <Input
          id='first_name'
          placeholder='Enter your first name'
          onChange={(e) => {
            setFirstName(e.target.value)
          }}
          value={first_name}
        />
      </div>
      <div className='space-y-1'>
        <Label htmlFor='last_name'>Last Name</Label>
        <Input
          id='last_name'
          placeholder='Enter your last name'
          onChange={(e) => {
            setLastName(e.target.value)
          }}
          value={last_name}
        />
      </div>
    </>
  )
}

function Password({
  pass1,
  setPass1,
  pass2,
  setPass2,
}: {
  pass1: string
  setPass1: React.Dispatch<React.SetStateAction<string>>
  pass2: string
  setPass2: React.Dispatch<React.SetStateAction<string>>
}) {
  return (
    <>
      <div className='space-y-1'>
        <Label htmlFor='pass1'>Password</Label>
        <Input
          id='pass1'
          placeholder='Enter your password'
          type='password'
          onChange={(e) => {
            setPass1(e.target.value)
          }}
          value={pass1}
        />
      </div>
      <div className='space-y-1'>
        <Label htmlFor='pass2'>Confirm Password</Label>
        <Input
          id='pass2'
          placeholder='Enter your password'
          type='password'
          onChange={(e) => {
            setPass2(e.target.value)
          }}
          value={pass2}
        />
      </div>
    </>
  )
}

function validation(first_name: string, last_name: string, email: string, pass1: string, pass2: string): userMessage {
  if (!first_name) return { message: 'First Name is required', error: true }
  if (!last_name) return { message: 'Last Name is required', error: true }
  if (!email) return { message: 'Email is required', error: true }
  if (pass1 || pass2) {
    if (!pass1) return { message: 'Password is required', error: true }
    if (!pass2) return { message: 'Confirm Password is required', error: true }
    if (pass1 !== pass2) return { message: 'Password and Confirm Password does not match', error: true }
  }
  return { message: '', error: false }
}
