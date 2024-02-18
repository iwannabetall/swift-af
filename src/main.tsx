import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import LeaderboardPage from './LeaderboardPage.tsx'
import './index.css'
import ErrorPage from "./error-page.tsx";
import Dataland from './Dataland.tsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

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
	// {
  //   path: "/endgame",
  //   element: <Leaderboard />,
  //   errorElement: <ErrorPage />,
  // },

]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
		 <RouterProvider router={router} />
    {/* <App /> */}
  </React.StrictMode>,
)
