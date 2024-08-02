import axios from "axios";
// import type { AxiosRequestConfig } from "axios";

import * as TS from './Constants.tsx'
const BASE_URL = TS.config.url

// const version = "v1";
// const base = `${env.NEXT_PUBLIC_BACKEND_URL}/api/${version}/match`;

// axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
// axios.defaults.xsrfCookieName = "csrftoken";



export async function getLeaderboard() : Promise<Leaderboard[]> {
  const URL = `${BASE_URL}/getLeaderboard`
  const response = await axios.get(URL);

  return response.data.leaderBoard
}

