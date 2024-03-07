import { app } from '../constants'
import ls from './ls'

const API_URL = app.api

type defaultHeaders = {
  'Content-Type': 'application/json'
  Accept: 'application/json'
}
export const defaultHeaders: defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}

type formDataHeaders = {
  ContentType: 'multipart/form-data'
  Accept: 'application/json'
  accept: 'application/json'
  //   secret: string
}
export const formDataHeaders: formDataHeaders = {
  //   secret: app.secret,
  Accept: 'application/json',
  accept: 'application/json',
  ContentType: 'multipart/form-data',
}

export function authorizedHeader(header: formDataHeaders | defaultHeaders) {
  return { ...header, Authorization: `Bearer ${ls.get('token')}` }
}

export type apiResponse = {
  status: boolean
  message: string
  data?: any
}

type errors = {
  [key: string]: string[]
}
export function getError(errors: errors) {
  const key = Object.keys(errors)[0]
  const value = errors[key][0]
  return value
}

async function returnResponse(res: any): Promise<apiResponse> {
  const data = await res.json()
  if (data.status === true) return { status: true, message: data.message, data: data }
  else if (data.message === 'Unauthenticated.') {
    ls.clear()
    // window.location.href = ''
    // alert('Unauthenticated')
    return { status: false, message: data.message || 'Network Error' }
  } else if (!data.errors) return { status: false, message: data.message || 'Network Error' }
  return { status: false, message: getError(data.errors) || data.message || 'Network Error' }
}

function catchError(err: any): apiResponse {
  console.log(err)
  return { status: false, message: 'Network Error' }
}

const API = {
  login: `${API_URL}/auth/login`,
  creator: {
    get_profile: `${API_URL}/profile/get_profile`,
    update_profile: `${API_URL}/profile/edit_profile`,
  },
  dashboard: {
    get_counts: `${API_URL}/dashboard/get_counts`,
  },
  videos: {
    upload: `${API_URL}/video/upload`,
    list: `${API_URL}/video/video_list`,
    delete: `${API_URL}/video/delete`,
    edit: `${API_URL}/video/edit`,
  },
  playlist: {
    create: `${API_URL}/playlist/create`,
    fetch: `${API_URL}/playlist/fetch`,
    delete: `${API_URL}/playlist/delete`,
    edit: `${API_URL}/playlist/edit`,
  },
  live: {
    create: `${API_URL}/video/live/create`,
    fetch: `${API_URL}/video/live/fetch`,
  },
  categories: {
    list: `${API_URL}/video/get_cat_list`,
  },
  liveChat: {
    message: `${API_URL}/livechat/messages`,
    fetch: `${API_URL}/livechat/fetch`,
  },
}
export default API

// All API calls

export async function create_playlist_f(body: FormData): Promise<apiResponse> {
  try {
    const headers = authorizedHeader(formDataHeaders)
    const res = await fetch(API.playlist.create, {
      method: 'POST',
      headers,
      body,
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function fetch_playlist_f(): Promise<apiResponse> {
  try {
    const headers = authorizedHeader(defaultHeaders)
    const res = await fetch(API.playlist.fetch, {
      method: 'POST',
      headers,
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function delete_playlist_f(id: number): Promise<apiResponse> {
  try {
    const headers = authorizedHeader(defaultHeaders)
    const res = await fetch(API.playlist.delete, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id }),
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function edit_playlist_f(body: FormData): Promise<apiResponse> {
  try {
    const headers = authorizedHeader(formDataHeaders)
    const res = await fetch(API.playlist.edit, {
      method: 'POST',
      headers,
      body,
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function fetch_live_chat_f(video_id: string): Promise<apiResponse> {
  try {
    const res = await fetch(API.liveChat.fetch, {
      method: 'POST',
      headers: authorizedHeader(defaultHeaders),
      body: JSON.stringify({ video_id }),
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function live_chat_message_f(message: string, video_id: string): Promise<apiResponse> {
  try {
    const res = await fetch(API.liveChat.message, {
      method: 'POST',
      headers: authorizedHeader(defaultHeaders),
      body: JSON.stringify({ message, video_id }),
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function create_live_f(body: FormData): Promise<apiResponse> {
  try {
    const headers = authorizedHeader(formDataHeaders)
    const res = await fetch(API.live.create, {
      method: 'POST',
      headers,
      body,
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function fetch_live_f(vid_id: number): Promise<apiResponse> {
  try {
    const headers = authorizedHeader(defaultHeaders)
    const res = await fetch(API.live.fetch, {
      method: 'POST',
      headers,
      body: JSON.stringify({ vid_id }),
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function get_cat_list_f(): Promise<apiResponse> {
  try {
    const headers = authorizedHeader(defaultHeaders)
    const res = await fetch(API.categories.list, {
      method: 'POST',
      headers,
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function edit_video_f(body: any): Promise<apiResponse> {
  try {
    const headers = authorizedHeader(formDataHeaders)
    const res = await fetch(API.videos.edit, {
      method: 'POST',
      headers,
      body,
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function delete_video_f(id: number): Promise<apiResponse> {
  try {
    const headers = authorizedHeader(defaultHeaders)
    const res = await fetch(API.videos.delete, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id }),
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function get_video_list_f(url: string): Promise<apiResponse> {
  try {
    const headers = authorizedHeader(defaultHeaders)
    const res = await fetch(url, {
      method: 'POST',
      headers,
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function get_videos_f(url: string): Promise<apiResponse> {
  try {
    const headers = authorizedHeader(defaultHeaders)
    const res = await fetch(url, {
      method: 'POST',
      headers,
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function get_counts_f(): Promise<apiResponse> {
  try {
    const headers = authorizedHeader(defaultHeaders)
    const res = await fetch(API.dashboard.get_counts, {
      method: 'POST',
      headers,
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function get_profile_f(): Promise<apiResponse> {
  try {
    const headers = authorizedHeader(defaultHeaders)
    const res = await fetch(API.creator.get_profile, {
      method: 'POST',
      headers,
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}

export async function login_f(email: string, password: string): Promise<apiResponse> {
  try {
    const body = { email, password }
    const res = await fetch(API.login, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(body),
    })
    return await returnResponse(res)
  } catch (err) {
    return catchError(err)
  }
}
