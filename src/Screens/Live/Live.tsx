import TapMotion from '@/components/TapMotion'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { fetch_live_chat_f, fetch_live_f, live_chat_message_f } from '@/lib/api'
import { BadgeCheckIcon, CheckIcon, CopyIcon, RadioIcon, SendIcon } from 'lucide-react'
import Pusher from 'pusher-js'
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import VideoPlayer from './VideoPlayer'
interface LiveVideo {
  title: string
  description: string
  privacy: 'public' | 'private'
  vid_id: number
}

export default function Live() {
  const { state } = useLocation() as { state: LiveVideo }
  const { title, description, privacy, vid_id } = state

  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false)

  const [streamId, setStreamId] = useState<string>('')
  const [streamUrl, setStreamUrl] = useState<string>('')
  const [streamKey, setStreamKey] = useState<string>('')
  const [playerUrl, setPlayerUrl] = useState<string>('')
  const [likes, setLikes] = useState<number>(0)
  const [viewers, setViewers] = useState<number>(0)

  async function loadVideoStatus(vid_id: number) {
    const res = await fetch_live_f(vid_id)
    // console.log(res.data.data)
    setIsBroadcasting(res.data.data.broadcasting)
    setStreamId(res.data.data.stream_id)
    setStreamUrl(res.data.data.streamUrl)
    setStreamKey(res.data.data.streamKey)
    setPlayerUrl(res.data.data.hls_player)
    setLikes(res.data.statics.likes)
    setViewers(res.data.statics.views)
  }
  useEffect(() => {
    console.log(state.vid_id)
    const interval = setInterval(() => {
      loadVideoStatus(state.vid_id)
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [state])

  useEffect(() => {
    loadVideoStatus(state.vid_id)
  }, [])

  return (
    <div className='pb-10'>
      <p className='text-2xl font-bold'>
        Live Streaming <RadioIcon height={35} width={35} className='ml-2 inline-block text-main' />
      </p>
      <div className='grid grid-cols-1 gap-5 xl:grid-cols-4'>
        <div className='col-span-1 xl:col-span-3'>
          <div className='flex flex-wrap gap-5'>
            <div className='grid w-full grid-cols-1 gap-5  xl:grid-cols-2'>
              {isBroadcasting ? (
                <div className='halka-border mt-5 w-full items-center justify-center overflow-hidden rounded-xl shadow-black/5'>
                  <div className='flex flex-col flex-wrap items-center justify-center gap-5'>
                    <VideoPlayer src={playerUrl} />
                  </div>
                </div>
              ) : (
                <div className='halka-border mt-5 flex w-full items-center justify-center overflow-hidden rounded-xl shadow-black/5'>
                  <div className='flex flex-col flex-wrap items-center justify-center gap-5 py-10'>
                    <div className='text-xl font-bold'>Waiting for stream to start</div>
                  </div>
                </div>
              )}
              <div className='halka-border mt-5 w-full rounded-xl shadow-black/5'>
                <div className='flex flex-col flex-wrap gap-5'>
                  <CardHeader className='p-2 pb-0'></CardHeader>
                  <CardContent className='flex flex-col gap-4 text-sm'>
                    <div>
                      <p className='opacity-60'>Title</p>
                      <p className='text-lg'>{title}</p>
                    </div>
                    <div>
                      <p className='opacity-60'>Description</p>
                      <p className='line-clamp-2'>{description || <span className='opacity-60'>No description</span>}</p>
                    </div>
                    <div>
                      <div className='mt-5 flex items-center justify-evenly gap-5 text-center'>
                        <div>
                          <p className='opacity-70'>Privacy</p>
                          <p className='text-base capitalize'>{privacy}</p>
                        </div>
                        <div>
                          <p className='opacity-70'>Viewers</p>
                          <p className='text-base'>{viewers}</p>
                        </div>
                        <div>
                          <p className='opacity-70'>Likes</p>
                          <p className='text-base'>{likes}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
              <div className='halka-border rounded-xl shadow-black/5'>
                <div className='flex flex-col flex-wrap gap-5'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex w-full flex-col items-center justify-center gap-3 text-center text-xl'>
                      <div>Stream Details</div>
                    </CardTitle>
                    <CardDescription className='flex flex-col gap-3 font-medium'></CardDescription>
                  </CardHeader>
                  <CardContent className='flex flex-col gap-3 text-sm'>
                    <div>
                      <p className='opacity-70'>Stream Key</p>
                      <div className='flex gap-2'>
                        <Input value={streamKey} readOnly type='password' />
                        <CopyButton text={streamKey} />
                      </div>
                    </div>
                    <div>
                      <p className='opacity-70'>Stream URL</p>
                      <div className='flex gap-2'>
                        <Input value={streamUrl} readOnly />
                        <CopyButton text={streamUrl} />
                      </div>
                    </div>
                    <div>
                      <p className='opacity-70'>Stream ID</p>
                      <div className='flex gap-2'>
                        <Input value={streamId} readOnly />
                        <CopyButton text={streamId} />
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='halka-border mt-5 w-full rounded-xl shadow-black/5'>
          <CardHeader className='pb-3 pt-5'>
            <CardTitle className='flex w-full flex-col items-center justify-center gap-3 text-center text-sm'>
              <div>Live Chat</div>
            </CardTitle>
            <CardDescription className='flex flex-col gap-3 font-medium'></CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3 p-0'>
            <LiveChat video_id={vid_id} />
          </CardContent>
        </div>
      </div>
    </div>
  )
}
{
  /* {privacy == 'public' ? (
  <>
    <GlobeIcon height={17} width={17} className='inline-block' />
    <span className='ml-2'>Public</span>
  </>
) : (
  <>
    <LockIcon height={17} width={17} className='inline-block' />
    <span className='ml-2'>Private</span>
  </>
)} */
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }

  return (
    <button className='halka-bg flex items-center justify-center rounded-sm p-3.5' onClick={copy}>
      {copied ? (
        <span className='text-green-500'>
          <CheckIcon height={12} width={12} />
        </span>
      ) : (
        <span>
          <CopyIcon height={12} width={12} />
        </span>
      )}
    </button>
  )
}

interface MessageT {
  created_at: string
  id: number
  name: string
  message: string
  avatar: string
  type: 'creator' | 'user'
}

function Message({ message }: { message: MessageT }) {
  return (
    <div className='flex items-center gap-4 pr-5'>
      <img src={message.avatar} alt='' className='h-8 w-8 rounded-full ' />
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2'>
          {message.type === 'creator' ? (
            <span className='flex items-center justify-center gap-1 text-xs font-semibold text-green-500'>
              Creator
              <BadgeCheckIcon height={13} width={13} className='mr-1 inline-block' strokeWidth={2.5} />
            </span>
          ) : (
            <span className='text-xs font-semibold'>{message.name}</span>
          )}
          <span className='text-xs opacity-60'>
            {new Date(message.created_at).toLocaleTimeString('en-US', {
              hour: 'numeric',
              hour12: true,
              minute: 'numeric',
            })}
          </span>
        </div>
        <div className='text-sm'>{message.message}</div>
      </div>
    </div>
  )
}

const MAX_MESSAGES_SIZE = 200

function LiveChat({ video_id }: { video_id: number }) {
  const [messages, setMessages] = useState<MessageT[]>([])
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)
  const inputRef = useRef<null | HTMLInputElement>(null)
  const messageBoxRef = useRef<null | HTMLDivElement>(null)

  async function loadLiveChatHistory() {
    if (!video_id) return
    const res = await fetch_live_chat_f(video_id.toString())
    if (!res.status) return console.log('Error loading live chat')
    setMessages(res.data.data.reverse() || [])
    setTimeout(() => {
      scrollToBottomForce()
    }, 500)
  }

  const scrollToBottom = () => {
    if (!messageBoxRef.current) return console.log('No message box')
    const scrollDiff = messageBoxRef.current?.scrollHeight - messageBoxRef.current?.scrollTop - messageBoxRef.current?.clientHeight
    if (scrollDiff < 200) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function scrollToBottomForce() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const pusher = new Pusher('6985392a5df45e560919', {
      cluster: 'ap2',
    })

    const channel = pusher.subscribe(video_id.toString())
    channel.bind('MessageSent', function (data: any) {
      console.log(data.message)
      setMessages((prev) => [...prev, data.message].slice(-MAX_MESSAGES_SIZE))
    })
    channel.bind('CreMessageSent', function (data: any) {
      console.log(data.message)
      setMessages((prev) => [...prev, data.message].slice(-MAX_MESSAGES_SIZE))
    })
  }, [])

  useEffect(() => {
    console.log('Scrolling to bottom')
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadLiveChatHistory()
  }, [video_id])

  async function sendMessage() {
    const message = inputRef.current?.value
    if (!message) return
    setIsSending(true)
    console.log(message)
    inputRef.current!.value = ''
    const res = await live_chat_message_f(message, video_id.toString())
    console.log(res)
    if (!res.status) return console.log('Error sending message')
    setIsSending(false)
  }

  return (
    <div>
      <div className='flex flex-col'>
        <div className='liveChat relative flex h-[67dvh] flex-col gap-4 overflow-auto p-5 pr-2' ref={messageBoxRef}>
          {messages.map((message, index) => (
            <Message message={message} key={index} />
          ))}
          <div ref={messagesEndRef} className='w-full'></div>
        </div>
        {/* <div className='flex cursor-pointer items-center justify-center pb-4 pt-1'>
          <ChevronsDownIcon className='text-white' />
        </div> */}
        <div className='flex gap-2 p-2 pt-0 text-sm'>
          <input
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage()
            }}
            type='text'
            placeholder='Write a message'
            className='focus:border-color/50 w-full rounded-full border border-transparent bg-white/10 p-2 px-4 text-sm outline-none backdrop-blur-md'
          />

          <TapMotion className='flex items-center justify-center rounded-full bg-white/10 p-3' onClick={sendMessage} size='lg'>
            {isSending ? <img src='/icons/other/loading.svg' className='aspect-square h-5 w-5 invert' /> : <SendIcon className='h-5 w-5' />}
          </TapMotion>
        </div>
      </div>
    </div>
  )
}
