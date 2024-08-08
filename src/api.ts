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

export async function getLyricStats(): Promise<LyricData[]> {

	const URL = `${BASE_URL}/getLyricStats`
  const response = await axios.get(URL);

  return response.data.lyricStats

}

export async function getFullLyricsNStats(album: string): Promise<LyricData[]> {

	if (album == 'imthefighter') {
		return []
	} else {
		const URL = `${BASE_URL}/getFullLyricsNStats`
		const response = await axios.get(URL, { params:
			{ 'album': album }
			});
		
		return response.data.fullLyricsNStats
	}
	

}


export async function getSongs(): Promise<SongList[]> {

	const URL = `${BASE_URL}/getSongs`
  const response = await axios.get(URL);

  return response.data.songList

}

export async function getSpotifyPlays(): Promise<SpotifyData[]> {

	const URL = `${BASE_URL}/getSpotifyPlays`
  const response = await axios.get(URL);

  return response.data.spotify_plays

}