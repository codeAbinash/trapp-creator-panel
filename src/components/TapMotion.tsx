import { motion } from 'framer-motion'
import { MouseEventHandler, forwardRef } from 'react'

type TapMotionProps = {
  children: React.ReactNode
  whileTap?: () => void
  whileHover?: () => void
  transition?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  onClick?: MouseEventHandler<HTMLDivElement>
}

const TapMotion = forwardRef<HTMLDivElement, TapMotionProps>((props, ref) => {
  // let { children, whileTap, whileHover, transition, className, size, onClick, ...pro } = props
  const { children, whileTap, whileHover, transition, className, onClick, ...pro } = props
  let { size } = props
  if (!size) size = 'md'
  return (
    <motion.div
      className={className}
      whileTap={whileTap || size == 'sm' ? { scale: 0.9 } : size == 'md' ? { scale: 0.95 } : { scale: 0.98 }}
      whileHover={whileHover || size == 'sm' ? { scale: 1.1 } : size == 'md' ? { scale: 1.05 } : { scale: 1.02 }}
      transition={transition || { type: 'spring', stiffness: 400 }}
      ref={ref}
      onClick={onClick}
      {...pro}
    >
      {children}
    </motion.div>
  )
})

export default TapMotion
