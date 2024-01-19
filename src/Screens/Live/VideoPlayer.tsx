import React, { useRef, useEffect } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import Hls from 'hls.js'

interface VideoPlayerProps {
  src: string
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<any>(undefined)

  useEffect(() => {
    if (!videoRef.current) return

    const initPlayer = () => {
      const player = videojs(videoRef.current!, {
        controls: true,
        fluid: true,
        autoplay: true,
        muted: true,
      })

      const checkStreamAvailability = () => {
        fetch(src)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Network response was not ok: ${response.statusText}`)
            }
            return response
          })
          .then(() => {
            // Stream is available, initialize the player
            initPlayer()
          })
          .catch(() => {
            // Stream is not available, retry after a delay
            setTimeout(checkStreamAvailability, 5000) // Retry after 5 seconds (adjust as needed)
          })
      }

      playerRef.current = player

      // Check if HLS is supported
      if (Hls.isSupported()) {
        const hls = new Hls()

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR && data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
            // Handle 404 error - Show custom error message
            playerRef.current?.error({
              code: 4, // MEDIA_ERR_SRC_NOT_SUPPORTED
              message: 'Stream Has Been Ended',
            })
            setTimeout(checkStreamAvailability, 5000) // Retry after 5 seconds (adjust as needed)
          }
        })

        hls.loadSource(src)
        hls.attachMedia(videoRef.current!)
      } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
        // Fallback to native HLS support on Safari
        player.src({
          src,
          type: 'application/vnd.apple.mpegurl',
        })
      }
    }

    initPlayer()

    return () => {
      // Dispose the player when the component is unmounted
      if (playerRef.current) {
        playerRef.current.dispose()
      }
    }
  }, [src])

  return (
    <div data-vjs-player>
      <video ref={videoRef} className='video-js' autoPlay />
    </div>
  )
}

export default VideoPlayer
