import { configureStore } from '@reduxjs/toolkit'

import profileSlice from './profile'

const store = configureStore({
  reducer: {
    profile: profileSlice,
  },
})
export default store
