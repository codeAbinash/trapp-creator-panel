import { Loading } from '@/components/Loading'
import TextEmoji from '@/components/TextEmoji'
import { ModeToggle } from '@/components/mode-toggle.tsx'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePopupAlertContext } from '@/context/PopupAlertContext'
import { login_f } from '@/lib/api'
import ls from '@/lib/ls'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// export function TabsDemo() {
//   return (
//     <Tabs defaultValue='creator' className='-mt-20 w-[95%] max-w-[450px]'>
//       <TabsList className='grid w-full grid-cols-2'>
//         <TabsTrigger value='creator'>Creator</TabsTrigger>
//         <div
//           className='flex w-full cursor-pointer items-center justify-center text-sm'
//           onClick={() => {
//             window.location.href = import.meta.env.VITE_ADMIN_PANEL_URL
//           }}
//         >
//           Admin
//         </div>
//       </TabsList>
//       <TabsContent value='creator'>
//         <Creator />
//       </TabsContent>
//       <TabsContent value='admin'>
//         <Admin />
//       </TabsContent>
//     </Tabs>
//   )
// }

function Header() {
  return (
    <div className='fixed top-0 w-full border border-transparent backdrop-blur-lg '>
      <div className='mx-auto flex max-w-7xl flex-row items-center justify-between p-4 py-3'>
        <img src='/AppIcons/full.png' className='w-16' />
        <div className='flex gap-5'>
          <ModeToggle />
          {/* <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
         </Avatar> */}
        </div>
      </div>
    </div>
  )
}

function Admin() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-2xl'>
          <span className='font-semibold'>
            Admin Login <TextEmoji emoji='👨‍💻' />
          </span>
        </CardTitle>
        <CardDescription className='font-medium'>
          Hello! <TextEmoji emoji='👋' /> Please login with your email and password.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-2'>
        <div className='space-y-1'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' placeholder='adminemail@gmail.com' type='email' />
        </div>
        <div className='space-y-1'>
          <Label htmlFor='password'>Password</Label>
          <Input id='password' placeholder='Enter your password' type='password' />
        </div>
      </CardContent>
      <CardFooter className='flex-col'>
        {/* <ReCAPTCHA
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          theme="dark"
        /> */}
        <Button className='w-full' size='lg'>
          Log In
        </Button>
        <Button className='mt-3 w-full text-blue-500' variant='link'>
          Forget Password?
        </Button>
      </CardFooter>
    </Card>
  )
}

// function onchange(val: any) {
//   console.log(val)
// }

function Creator() {
  // const [email, setEmail] = useState('creator@gmail.com')
  // const [password, setPassword] = useState('123456')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { newPopup } = usePopupAlertContext()
  const navigate = useNavigate()

  async function handelSubmit() {
    const email_f = email.trim()
    const password_f = password.trim()
    if (!email_f || !password_f) return newPopup({ title: 'Error', subTitle: 'Please fill all the fields' })
    setIsLoading(true)
    const res = await login_f(email_f, password_f)
    setIsLoading(false)
    if (!res.status) return newPopup({ title: 'Error', subTitle: res.message })
    ls.set('token', res.data.token)
    navigate('/')
  }

  return (
    <>
      <Card className='w-[95%] max-w-[450px]'>
        <CardHeader>
          <CardTitle className='text-2xl'>
            <span className='font-semibold'>
              Creator Login <TextEmoji emoji='🎨' />
            </span>
          </CardTitle>
          <CardDescription className='font-medium'>
            Hello! <TextEmoji emoji='👋' /> Please login with your email and password.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='space-y-1'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              placeholder='adminemail@gmail.com'
              type='email'
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              value={email}
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              placeholder='Enter your password'
              type='password'
              onChange={(e) => {
                setPassword(e.target.value)
              }}
              value={password}
            />
          </div>
        </CardContent>
        <CardFooter className='flex-col'>
          {/* <ReCAPTCHA
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          theme="dark"
          onChange={onchange}
        /> */}
          <Button className='w-full' size='lg' onClick={handelSubmit} disabled={isLoading}>
            {isLoading ? <Loading text='Please wait...' invert='invert' /> : 'Log In'}
          </Button>
          <Button className='mt-3 w-full text-blue-500' variant='link'>
            Forget Password?
          </Button>
        </CardFooter>
      </Card>
    </>
  )
}

export default function Login() {
  return (
    <>
      <Header />
      <div className='flex min-h-[100dvh] flex-col items-center justify-center gap-5 bg-gradient-to-tr from-red-100 to-blue-100 pt-20 dark:from-red-950/40 dark:to-blue-950/40'>
        {/* <img src="AppIcons/full.svg" className="w-44 -mt-16" /> */}
        {/* <TabsDemo /> */}
        <Creator />
      </div>
    </>
  )
}
