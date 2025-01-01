import axios from "axios";
// import type { AxiosRequestConfig } from "axios";

import * as TS from '../Constants.tsx'
const BASE_URL = TS.config.url

// const version = "v1";
// const base = `${env.NEXT_PUBLIC_BACKEND_URL}/api/${version}/match`;

// axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
// axios.defaults.xsrfCookieName = "csrftoken";

const forgotyouexisted = TS.forgotyouexisted


export async function getLeaderboard() : Promise<Leaderboard[]> {
  const URL = `${BASE_URL}/getLeaderboard`
  const response = await axios.get(URL, { params:
		{ 'florida': forgotyouexisted }
	})

  return response.data.leaderBoard
}

export async function getLyricStats(): Promise<LyricData[]> {

	const URL = `${BASE_URL}/getLyricStats`
  const response = await axios.get(URL, { params:
		{ 'florida': forgotyouexisted }
	})

  return response.data.lyricStats

}


export async function getLyrics(): Promise<Lyrics[]> {

	const URL = `${BASE_URL}/getLyrics`
  const response = await axios.get(URL, { params:
		{ 'florida': forgotyouexisted, 'getLyrics': getLyrics }
	})

  return response.data.lyrics

}

export async function getFullLyricsNStats(album: string): Promise<LyricData[]> {

	if (album == 'imthefighter') {
		return []
	} else {
		const URL = `${BASE_URL}/getFullLyricsNStats`
		const response = await axios.get(URL, { params:
			{ 'album': album, 'florida': forgotyouexisted }
			});
		
		return response.data.fullLyricsNStats
	}
	

}


export async function getUserStats(sess_id: string): Promise<GameResults[]> {

	const URL = `${BASE_URL}/getUserStats`
  const response = await axios.post(URL, {
		 'sess_id': sess_id,
		 'florida': forgotyouexisted
		});

  return response.data.userGameStats

}


export async function getSongs(): Promise<SongList[]> {

	const URL = `${BASE_URL}/getSongs`
  const response = await axios.get(URL, { params:
		{ 'florida': forgotyouexisted }
	})

  return response.data.songList

}

export async function getSpotifyPlays(): Promise<SpotifyData[]> {

	const URL = `${BASE_URL}/getSpotifyPlays`
  const response = await axios.get(URL, { params:
		{ 'florida': forgotyouexisted }
	})

  return response.data.spotify_plays

}