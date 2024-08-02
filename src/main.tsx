import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import LeaderboardPage from './LeaderboardPage.tsx'
import './index.css'
import ErrorPage from "./error-page.tsx";
import Dataland from './Dataland.tsx'
import SignUpPage from './SignUpPage.tsx'
import MyStats from './MyStats.tsx'
import LoginPage from './LoginPage.tsx'
import { CookiesProvider } from 'react-cookie';
import ResetPassword from './ResetPassword.tsx'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"

const queryClient = new QueryClient()

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
    path: "/me",
    element: <MyStats />,
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
	{
    path: "/i-forgot-you-existed/:id",
    element: <ResetPassword />,
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
			<QueryClientProvider client={queryClient}>
		 <RouterProvider router={router} />
		 </QueryClientProvider>
		</CookiesProvider>
    {/* <App /> */}
  </React.StrictMode>,
)
