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
