import { flushSync } from 'react-dom'
const CLICK_DELAY = 0

export default function transitions(callback: () => void, delay = CLICK_DELAY) {
  if (!document.startViewTransition) {
    return function () {
      setTimeout(callback, delay)
    }
  }
  return function () {
    setTimeout(() => {
      document.startViewTransition(() => {
        flushSync(() => callback())
      })
    }, delay)
  }
}
