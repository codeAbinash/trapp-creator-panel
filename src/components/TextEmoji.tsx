import emoji from 'emoji-store'

export function parseEmoji(emoji: string) {
  if (!emoji) return ['']
  //@ts-expect-error - Intl.Segmenter() may not be available in all browsers
  const emojis = [...new Intl.Segmenter().segment(emoji)].map((x) => x.segment)
  return emojis
}
export default function TextEmoji({ emoji: e = '😍' }) {
  return <img src={emoji(e)} loading='lazy' className='inline-block aspect-square h-[1em] align-middle' />
}
