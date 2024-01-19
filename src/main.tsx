import { lazyWithPreload } from 'react-lazy-with-preload'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './css/index.css'
import './css/index.scss'

import { ThemeProvider } from '@/components/theme-provider'
import store from './Redux/store.ts'
import Dashboard from './Screens/Dashboard.tsx'
import Home from './Screens/Home.tsx'
import Login from './Screens/Login.tsx'
import PopupAlert from './components/PopupAlert.tsx'
import { PopupAlertContextProvider } from './context/PopupAlertContext.tsx'
import Live from './Screens/Live/Live.tsx'

const Videos = lazyWithPreload(() => import('./Screens/Videos/Videos.tsx'))
const EditProfile = lazyWithPreload(() => import('./Screens/EditProfile/EditProfile.tsx'))
const CreateLive = lazyWithPreload(() => import('./Screens/Live/CreateLive.tsx'))
const Test = lazyWithPreload(() => import('./Screens/Test.tsx'))
const EditVideo = lazyWithPreload(() => import('./Screens/Videos/EditVideo.tsx'))
const Upload = lazyWithPreload(() => import('./Screens/Videos/Upload.tsx'))

Videos.preload()
EditProfile.preload()
CreateLive.preload()
Test.preload()
EditVideo.preload()
Upload.preload()

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/videos',
        element: <Videos />,
      },
      {
        path: '/videos/upload',
        element: <Upload />,
      },
      {
        path: '/videos/edit',
        element: <EditVideo />,
      },
      {
        path: '/videos/create_live',
        element: <CreateLive />,
      },
      {
        path: '/videos/live',
        element: <Live />,
      },
      {
        path: '/edit_profile',
        element: <EditProfile />,
      },
      {
        path: 'test',
        element: <Test />,
      },
    ],
    // errorElement: <ErrorUI />,
  },
  {
    path: '/login',
    element: <Login />,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <Provider store={store}>
    <PopupAlertContextProvider>
      <PopupAlert />
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <RouterProvider router={router} />
      </ThemeProvider>
    </PopupAlertContextProvider>
  </Provider>,
  // </React.StrictMode>,
)
