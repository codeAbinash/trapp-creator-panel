import API from '@/lib/api'

export const defaultPagination = {
  first_page_url: API.videos.list,
  last_page_url: '',
  links: [],
}

export type PaginationT = {
  first_page_url: string
  last_page_url: string
  links: {
    url: string | null
    label: string
    active: boolean
  }[]
}

export interface Category {
  id: number
  image: string
  title: string
  created_at: string
  updated_at: string
}

export interface Playlist {
  id: number
  thumbnail: string
  name: string
  playlist_name: string
  created_at: string
  updated_at: string
}
