import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import seasonReducer from '../features/season/seasonSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    season: seasonReducer,
  },
});
