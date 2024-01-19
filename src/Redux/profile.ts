import ls from '@/lib/ls'
import { CreatorProfile } from '@/lib/types'
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export function getProfileInfoLs(): CreatorProfile {
  return JSON.parse(ls.get('creatorProfile') || 'null')
}

export function setProfileInfoLs(data: CreatorProfile): void {
  ls.set('creatorProfile', JSON.stringify(data))
}

const initialState: CreatorProfile = getProfileInfoLs()

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (_, action: PayloadAction<CreatorProfile>) => {
      return action.payload
    },
  },
})

export const { setProfile } = profileSlice.actions

export default profileSlice.reducer
