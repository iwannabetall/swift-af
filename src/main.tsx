import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import LeaderboardPage from './LeaderboardPage.tsx'
import './index.css'
import ErrorPage from "./error-page.tsx";
import Dataland from './Dataland.tsx'
import SignUpPage from './SignUpPage.tsx'
import UserStats from './UserStats.tsx'
import LoginPage from './LoginPage.tsx'
import { CookiesProvider } from 'react-cookie';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
// import { Route, Routes, Router } from "react-router-dom";
// import OldSignUpPage from './SignUpPage.tsx'


const router = createBrowserRouter([
	{
    path: "/",
    element: <App/>,
    errorElement: <ErrorPage />,
  }, 
	{
    path: "/leaderboard",
    element: <LeaderboardPage />,
    errorElement: <ErrorPage />,
  },	
	{
    path: "/dataland",
    element: <Dataland />,
    errorElement: <ErrorPage />,
  },
	{
    path: "/me!",
    element: <UserStats />,
    errorElement: <ErrorPage />,
  },
	{
    path: "/rememberme",
    element: <SignUpPage />,
    errorElement: <ErrorPage />,
  },
	{
    path: "/hi-its-me",
    element: <LoginPage />,
    errorElement: <ErrorPage />,
  },

	// {
  //   path: "/endgame",
  //   element: <Leaderboard />,
  //   errorElement: <ErrorPage />,
  // },

]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
		<CookiesProvider>
			{/* <Router>
				<Routes>
				<Route path='/' element={<App/>} errorElement={<ErrorPage/>}/>
				<Route path='/leaderboard' element={<LeaderboardPage/>} errorElement={<ErrorPage/>}/>
				<Route path='/dataland' element={<Dataland/>} errorElement={<ErrorPage/>}/>
				<Route path='/rememberme' element={<OldSignUpPage signingUp={true}/>} errorElement={<ErrorPage/>}/>
				<Route path='/hi-its-me' element={<OldSignUpPage signingUp={false}/>} errorElement={<ErrorPage/>}/>
				</Routes>
			</Router> */}
		 <RouterProvider router={router} />
		</CookiesProvider>
    {/* <App /> */}
  </React.StrictMode>,
)
