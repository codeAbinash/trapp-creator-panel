export type CreatorProfile = {
  id: number
  first_name: string
  last_name: string
  email: string
  // profile_pic: string
  channel_logo: string
  channel_banner: string
  channel_name: string
  contact_address: string
  phone_number: string
} | null

export type DashboardCounts = {
  revenue: number
  followers: number
  videos: number
  live: number
} | null

export type userMessage = {
  message: string
  error: boolean
}
