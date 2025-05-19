import { ChevronDownIcon, DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import Pagination from './Pagination'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DEFAULT_PP } from '@/constants'

import { Loading } from '@/components/Loading'
import { NEXT_POPUP_DELAY } from '@/config'
import { PopupAlertType, usePopupAlertContext } from '@/context/PopupAlertContext'
import API, { delete_video_f, get_video_list_f } from '@/lib/api'
import transitions from '@/lib/transition'
import { EyeIcon, Pencil, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { PaginationT, defaultPagination } from './types'

function getReducedString(str: string, len = 30) {
  if (!str) return str
  if (str.length <= len) return str
  return str.slice(0, len) + '...'
}

function formattedDate(date: string) {
  return new Date(date).toLocaleDateString('en-US')
}

function deleteVideo(id: number, newPopup: (popup: PopupAlertType) => void, navigate: NavigateFunction) {
  newPopup({
    title: 'Delete Video',
    subTitle: 'Are you sure you want to delete this video?',
    action: [
      {
        text: <span className='text-red-500'>Yes</span>,
        onClick: async () => {
          setTimeout(() => {
            newPopup({
              title: (
                <span className='flex'>
                  <Loading /> Please Wait...
                </span>
              ),
              subTitle: 'Deleting video with id ' + id,
              action: [],
            })
          }, NEXT_POPUP_DELAY)

          const res = await delete_video_f(id)
          if (!res.status) return transitions(() => newPopup({ title: 'Error', subTitle: res.message }))()
          newPopup({
            title: 'Video Deleted',
            subTitle: 'Video deleted successfully. Refresh page to see changes.',
            action: [{ text: 'OK', onClick: () => navigate(0) }],
          })
        },
      },
      {
        text: 'No',
        onClick: () => {
          console.log('no delete video')
        },
      },
    ],
  })
}

export interface VideoData {
  id: number
  creator_id: string
  title: string
  description: string
  privacy: string
  thumbnail: string
  video_loc: string
  video_type: string
  created_at: string
  updated_at: string
  details: JSX.Element
  playlist_id: string
  cat_id: string
  views: number
  live_api_data: null
  video_duration: string
  like_count: string
  dislike_count: string
}

const columns: ColumnDef<VideoData>[] = [
  {
    accessorKey: 'thumbnail',
    header: 'Thumbnail',
    cell: ({ row }) => (
      <img src={row.getValue('thumbnail') ?? DEFAULT_PP} className='aspect-video h-[4.5rem] w-[8rem] rounded-sm object-cover' alt='' />
    ),
  },
  {
    accessorKey: 'details',
    header: 'Details',
    cell: ({ row }) => <p>{row.getValue('details')}</p>,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => <div className='line-clamp-1 max-w-[30ch] break-words font-[450]'>{getReducedString(row.getValue('title'))}</div>,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => <div className='line-clamp-1 max-w-[30ch] font-[450]'>{getReducedString(row.getValue('description'))}</div>,
  },
  {
    accessorKey: 'video_type',
    header: 'Type',
    cell: ({ row }) => <div className='font-[450] capitalize'>{row.getValue('video_type')}</div>,
  },
  {
    accessorKey: 'privacy',
    header: 'Privacy',
    cell: ({ row }) => <div className='font-[450] capitalize'>{row.getValue('privacy')}</div>,
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => <div className='font-[450]'>{formattedDate(row.getValue('created_at'))}</div>,
  },
  {
    accessorKey: 'id',
    header: 'Video ID',
    cell: ({ row }) => <div className='font-[450]'>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'playlist_id',
    header: 'Playlist ID',
    cell: ({ row }) => <div className='font-[450]'>{row.getValue('playlist_id')}</div>,
  },
  {
    accessorKey: 'cat_id',
    header: 'Category ID',
    cell: ({ row }) => <div className='font-[450]'>{row.getValue('cat_id')}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    header: 'Action',
    cell: ({ row }) => {
      // const [deletePopup, setDeletePopup] = useState(false)
      // const [banPopup, setBanPopup] = useState(false)
      // const [unbanPopup, setUnbanPopup] = useState(false)
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { newPopup } = usePopupAlertContext()
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const navigate = useNavigate()

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <DotsHorizontalIcon className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className='text-red-500'
              onClick={() => {
                deleteVideo(row.getValue('id'), newPopup, navigate)
              }}
            >
              <Trash2 className='mr-3 h-4 w-4' />
              Delete Video
            </DropdownMenuItem>
            <DropdownMenuItem
              className='text-green-500'
              onClick={() => {
                navigate(`/videos/edit`, {
                  state: {
                    id: row.getValue('id'),
                    title: row.getValue('title'),
                    description: row.getValue('description'),
                    thumbnail: row.getValue('thumbnail'),
                    privacy: row.getValue('privacy'),
                    playlist_id: row.getValue('playlist_id'),
                    cat_id: row.getValue('cat_id'),
                  },
                })
              }}
            >
              <Pencil className='mr-3 h-4 w-4' />
              Edit Video
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

const sampleData: VideoData[] = [
  {
    id: 1,
    creator_id: 'creator_1',
    title: 'Sample Video 1',
    description: 'This is a sample video description.',
    privacy: 'public',
    thumbnail: 'https://picsum.photos/300/200',
    video_loc: 'sample_video_1.mp4',
    video_type: 'mp4',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    details: (
      <div className='flex gap-5'>
        <div className='flex flex-col items-center justify-center'>
          100
          <EyeIcon size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          10
          <ThumbsUp size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          1
          <ThumbsDown size={15} />
        </div>
      </div>
    ),
    playlist_id: 'playlist_1',
    cat_id: 'category_1',
    views: 100,
    live_api_data: null,
    video_duration: '00:10:00',
    like_count: '10',
    dislike_count: '1',
  },
  {
    id: 2,
    creator_id: 'creator_2',
    title: 'Sample Video 2',
    description: 'This is another sample video description.',
    privacy: 'private',
    thumbnail: 'https://picsum.photos/301/200',
    video_loc: 'sample_video_2.mp4',
    video_type: 'mp4',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    details: (
      <div className='flex gap-5'>
        <div className='flex flex-col items-center justify-center'>
          200
          <EyeIcon size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          20
          <ThumbsUp size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          2
          <ThumbsDown size={15} />
        </div>
      </div>
    ),
    playlist_id: 'playlist_2',
    cat_id: 'category_2',
    views: 200,
    live_api_data: null,
    video_duration: '00:20:00',
    like_count: '20',
    dislike_count: '2',
  },
  {
    id: 3,
    creator_id: 'creator_3',
    title: 'Sample Video 3',
    description: 'This is yet another sample video description.',
    privacy: 'public',
    thumbnail: 'https://picsum.photos/302/200',
    video_loc: 'sample_video_3.mp4',
    video_type: 'mp4',
    created_at: '2023-01-03T00:00:00Z',
    updated_at: '2023-01-03T00:00:00Z',
    details: (
      <div className='flex gap-5'>
        <div className='flex flex-col items-center justify-center'>
          300
          <EyeIcon size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          30
          <ThumbsUp size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          3
          <ThumbsDown size={15} />
        </div>
      </div>
    ),
    playlist_id: 'playlist_3',
    cat_id: 'category_3',
    views: 300,
    live_api_data: null,
    video_duration: '00:30:00',
    like_count: '30',
    dislike_count: '3',
  },
  {
    id: 4,
    creator_id: 'creator_4',
    title: 'Sample Video 4',
    description: 'This is a sample video description.',
    privacy: 'public',
    thumbnail: 'https://picsum.photos/303/200',
    video_loc: 'sample_video_4.mp4',
    video_type: 'mp4',
    created_at: '2023-01-04T00:00:00Z',
    updated_at: '2023-01-04T00:00:00Z',
    details: (
      <div className='flex gap-5'>
        <div className='flex flex-col items-center justify-center'>
          400
          <EyeIcon size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          40
          <ThumbsUp size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          4
          <ThumbsDown size={15} />
        </div>
      </div>
    ),
    playlist_id: 'playlist_4',
    cat_id: 'category_4',
    views: 400,
    live_api_data: null,
    video_duration: '00:40:00',
    like_count: '40',
    dislike_count: '4',
  },
  {
    id: 5,
    creator_id: 'creator_5',
    title: 'Sample Video 5',
    description: 'This is another sample video description.',
    privacy: 'private',
    thumbnail: 'https://picsum.photos/304/200',
    video_loc: 'sample_video_5.mp4',
    video_type: 'mp4',
    created_at: '2023-01-05T00:00:00Z',
    updated_at: '2023-01-05T00:00:00Z',
    details: (
      <div className='flex gap-5'>
        <div className='flex flex-col items-center justify-center'>
          500
          <EyeIcon size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          50
          <ThumbsUp size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          5
          <ThumbsDown size={15} />
        </div>
      </div>
    ),
    playlist_id: 'playlist_5',
    cat_id: 'category_5',
    views: 500,
    live_api_data: null,
    video_duration: '00:50:00',
    like_count: '50',
    dislike_count: '5',
  },
  {
    id: 6,
    creator_id: 'creator_6',
    title: 'Sample Video 6',
    description: 'This is yet another sample video description.',
    privacy: 'public',
    thumbnail: 'https://picsum.photos/305/200',
    video_loc: 'sample_video_6.mp4',
    video_type: 'mp4',
    created_at: '2023-01-06T00:00:00Z',
    updated_at: '2023-01-06T00:00:00Z',
    details: (
      <div className='flex gap-5'>
        <div className='flex flex-col items-center justify-center'>
          600
          <EyeIcon size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          60
          <ThumbsUp size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          6
          <ThumbsDown size={15} />
        </div>
      </div>
    ),
    playlist_id: 'playlist_6',
    cat_id: 'category_6',
    views: 600,
    live_api_data: null,
    video_duration: '01:00:00',
    like_count: '60',
    dislike_count: '6',
  },
  {
    id: 7,
    creator_id: 'creator_7',
    title: 'Sample Video 7',
    description: 'This is a sample video description.',
    privacy: 'public',
    thumbnail: 'https://picsum.photos/306/200',
    video_loc: 'sample_video_7.mp4',
    video_type: 'mp4',
    created_at: '2023-01-07T00:00:00Z',
    updated_at: '2023-01-07T00:00:00Z',
    details: (
      <div className='flex gap-5'>
        <div className='flex flex-col items-center justify-center'>
          700
          <EyeIcon size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          70
          <ThumbsUp size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          7
          <ThumbsDown size={15} />
        </div>
      </div>
    ),
    playlist_id: 'playlist_7',
    cat_id: 'category_7',
    views: 700,
    live_api_data: null,
    video_duration: '01:10:00',
    like_count: '70',
    dislike_count: '7',
  },
  {
    id: 8,
    creator_id: 'creator_8',
    title: 'Sample Video 8',
    description: 'This is another sample video description.',
    privacy: 'private',
    thumbnail: 'https://picsum.photos/307/200',
    video_loc: 'sample_video_8.mp4',
    video_type: 'mp4',
    created_at: '2023-01-08T00:00:00Z',
    updated_at: '2023-01-08T00:00:00Z',
    details: (
      <div className='flex gap-5'>
        <div className='flex flex-col items-center justify-center'>
          800
          <EyeIcon size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          80
          <ThumbsUp size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          8
          <ThumbsDown size={15} />
        </div>
      </div>
    ),
    playlist_id: 'playlist_8',
    cat_id: 'category_8',
    views: 800,
    live_api_data: null,
    video_duration: '01:20:00',
    like_count: '80',
    dislike_count: '8',
  },
  {
    id: 9,
    creator_id: 'creator_9',
    title: 'Sample Video 9',
    description: 'This is yet another sample video description.',
    privacy: 'public',
    thumbnail: 'https://picsum.photos/308/200',
    video_loc: 'sample_video_9.mp4',
    video_type: 'mp4',
    created_at: '2023-01-09T00:00:00Z',
    updated_at: '2023-01-09T00:00:00Z',
    details: (
      <div className='flex gap-5'>
        <div className='flex flex-col items-center justify-center'>
          900
          <EyeIcon size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          90
          <ThumbsUp size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          9
          <ThumbsDown size={15} />
        </div>
      </div>
    ),
    playlist_id: 'playlist_9',
    cat_id: 'category_9',
    views: 900,
    live_api_data: null,
    video_duration: '01:30:00',
    like_count: '90',
    dislike_count: '9',
  },
  {
    id: 10,
    creator_id: 'creator_10',
    title: 'Sample Video 10',
    description: 'This is a sample video description.',
    privacy: 'public',
    thumbnail: 'https://picsum.photos/309/200',
    video_loc: 'sample_video_10.mp4',
    video_type: 'mp4',
    created_at: '2023-01-10T00:00:00Z',
    updated_at: '2023-01-10T00:00:00Z',
    details: (
      <div className='flex gap-5'>
        <div className='flex flex-col items-center justify-center'>
          1000
          <EyeIcon size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          100
          <ThumbsUp size={15} />
        </div>
        <div className='flex flex-col items-center justify-center'>
          10
          <ThumbsDown size={15} />
        </div>
      </div>
    ),
    playlist_id: 'playlist_10',
    cat_id: 'category_10',
    views: 1000,
    live_api_data: null,
    video_duration: '01:40:00',
    like_count: '100',
    dislike_count: '10',
  },
]

export default function Creators() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    playlist_id: false,
    cat_id: false,
    id: false,
  })
  const [rowSelection, setRowSelection] = useState({})
  const [videos, setVideos] = useState<VideoData[] | null>(null)
  const [pagination, setPagination] = useState<PaginationT>(defaultPagination)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadVideos()
  }, [])

  async function loadVideos(url = API.videos.list) {
    setIsLoading(true)
    const res = await get_video_list_f(url)
    setIsLoading(false)
    if (!res.status) {
      setVideos(sampleData)
      return
    }
    console.log(res.data.data.data)

    setVideos(generateOrganizedData(res.data.data.data))
    // setVideos(res.data.data.data)

    setPagination({
      first_page_url: res.data.data.first_page_url,
      last_page_url: res.data.data.last_page_url,
      links: res.data.data.links,
    })
  }

  const table = useReactTable({
    data: videos || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className='w-full whitespace-pre'>
      <p className='text-2xl font-bold'>Video List 🎥</p>

      <div className='flex items-center gap-2 py-4'>
        <Input
          placeholder='Filter Videos...'
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' className='halka-bg halka-border ml-auto'>
              Columns <ChevronDownIcon className='ml-2 h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {/* {column.id} */}
                    {column.columnDef.header as string}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='halka-border rounded-md'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='border-black/5 dark:border-white/5'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className='border-black/5 dark:border-white/5'>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className='border-black/5 dark:border-white/5'>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  {!videos ? <Loading text='Loading Videos...' invert='auto' /> : videos.length ? 'No results.' : 'No video found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-center space-x-2 '>
        <Pagination pagination={pagination} loadVideos={loadVideos} isLoading={isLoading} />
      </div>
    </div>
  )
}

function generateOrganizedData(data: VideoData[]) {
  const organizedData: VideoData[] = data.map((user) => {
    const obj: VideoData = {
      id: user.id,
      creator_id: user.creator_id,
      title: user.title,
      description: user.description ?? '',
      privacy: user.privacy,
      thumbnail: user.thumbnail,
      video_loc: user.video_loc,
      video_type: user.video_type,
      created_at: user.created_at,
      updated_at: user.updated_at,
      playlist_id: user.playlist_id,
      cat_id: user.cat_id,
      views: user.views,
      live_api_data: null,
      video_duration: '00:00:00',
      like_count: user.like_count,
      dislike_count: user.dislike_count,
      details: (
        <div className='flex gap-5'>
          <div className='flex flex-col items-center justify-center'>
            {user.views}
            <EyeIcon size={15} />
          </div>
          <div className='flex flex-col items-center justify-center'>
            {user.like_count}
            <ThumbsUp size={15} />
          </div>
          <div className='flex flex-col items-center justify-center'>
            {user.dislike_count}
            <ThumbsDown size={15} />
          </div>
        </div>
      ),
    }
    return obj
  })
  return organizedData
}
