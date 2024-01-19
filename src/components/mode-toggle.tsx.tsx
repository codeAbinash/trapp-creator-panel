import { Moon, Palette, Sun } from 'lucide-react'

import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon' className='rounded-full bg-black/5 dark:bg-white/5'>
          <Sun className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
          <Moon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem className='font-medium' onClick={() => setTheme('light')}>
          <Sun className='mr-2 h-4 w-4' />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem className='font-medium' onClick={() => setTheme('dark')}>
          <Moon className='mr-2 h-4 w-4' />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem className='font-medium' onClick={() => setTheme('system')}>
          <Palette className='mr-2 h-4 w-4' />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
