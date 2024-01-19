import { Button } from '@/components/ui/button'

import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons'

import { Loading } from '@/components/Loading'
import { PaginationT } from './types'

export default function Pagination({
  pagination,
  loadVideos,
  isLoading,
}: {
  pagination: PaginationT
  loadVideos: (url: string) => void
  isLoading: boolean
}) {
  return (
    <div className='mt-10  flex flex-col gap-5'>
      <div className='h-5 text-sm opacity-50'>{isLoading && <Loading text='Fetching data...' invert='auto' />}</div>
      <div className='flex items-center gap-2'>
        <Button variant='outline' className='h-8 w-8 p-0' onClick={() => loadVideos(pagination.first_page_url)} disabled={!pagination.first_page_url}>
          <DoubleArrowLeftIcon className='h-4 w-4' />
        </Button>
        {pagination.links.map((link, index) => {
          if (link.label === '&laquo; Previous')
            return (
              <Button variant='outline' className='h-8 w-8 p-0' disabled={!link.url} key={index} onClick={() => loadVideos(link.url as string)}>
                <ChevronLeftIcon className='h-4 w-4' />
              </Button>
            )
          if (link.label === 'Next &raquo;')
            return (
              <Button variant='outline' className='h-8 w-8 p-0' disabled={!link.url} key={index} onClick={() => loadVideos(link.url as string)}>
                <ChevronRightIcon className='h-4 w-4' />
              </Button>
            )
          else {
            return (
              <Button
                variant={link.active ? 'default' : 'outline'}
                className='h-8 w-8 p-0'
                key={index}
                disabled={!link.url}
                onClick={() => loadVideos(link.url as string)}
              >
                {link.label}
              </Button>
            )
          }
        })}
        <Button variant='outline' className='h-8 w-8 p-0' onClick={() => loadVideos(pagination.last_page_url)} disabled={!pagination.last_page_url}>
          <DoubleArrowRightIcon className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
