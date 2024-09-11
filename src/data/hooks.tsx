import { getSongs, getLyrics, getSpotifyPlays, getLeaderboard } from './api.ts'
import { useQuery } from "@tanstack/react-query";
import * as d3 from 'd3';
import useScreenSize from '../useScreenSize.tsx';


const normal = "classics version" as const
const challenging = 'Tortured Classics' as const
const hard = "Taylor's Version" as const
const pro = "The Eras" as const
const expert = 'cult version' as const


export function useSongs(gameMode: string, albumMode: string) {
	return useQuery({
		// do i need gameMode and albumMode as query keys if i always want the same cached data pulled?? what happens if i just want something to filter 
		queryKey: ['getSongs'], 
		select: (res): SongList[]=> {
			
			if (gameMode == 'easy'){				
				return res.filter(x=> x.vault == 0 && x.album_key != 'TTPD')
			} else if (gameMode == normal) {
				return res.filter(x=> x.vault == 0 && x.album_key != 'TTPD')
			} else if (gameMode == challenging) {
				// normal + TTPD 			
				return res.filter(x=> x.vault == 0)
	
			} else if (gameMode == hard) {
				// hard is all + more recent vault songs but no filler				
				return res.filter(x=> x.album_key != 'TTPD')
			} else if (gameMode == pro) {
				// pro gameMode = TV + TTPD				
				return res
			} else if (gameMode == expert) {
				// expert gameMode has vault songs and only filler words lmao				
				return res
			} else {
				// filter by album 				
				return res.filter(x=> x.album == albumMode)
			}
		},
		queryFn: () => getSongs(),
	})

}

export function useLyricsData(gameMode: string, albumMode: string) {
	return useQuery({
		queryKey: ['getLyrics'], 
		select: (res): Lyrics[] => {
			if (gameMode == 'easy'){
				return res.filter(x=> x.filler == 0 && x.vault == 0 && x.album_key != 'TTPD')		
			} else if (gameMode == normal) {
				return res.filter(x=> x.filler == 0 && x.vault == 0 && x.title_in_lyric_match < 70 && x.album_key != 'TTPD')
			} else if (gameMode == challenging) {
				// normal + TTPD 
				return res.filter(x=> x.filler == 0 && x.vault == 0 && x.title_in_lyric_match < 70)	
			} else if (gameMode == hard) {
				// hard is all + more recent vault songs but no filler
				return res.filter(x=> x.filler == 0 && x.title_in_lyric_match < 70 && x.album_key != 'TTPD')		
			} else if (gameMode == pro) {
				// pro gameMode = TV + TTPD
				return res.filter(x=> x.filler == 0 && x.title_in_lyric_match < 70)		
			} else if (gameMode == expert) {
				// expert gameMode has vault songs and only filler words lmao
				return res.filter(x=> x.filler == 1)		
			} else {
				// filter by album 			
				return res.filter(x=> x.album == albumMode && x.filler == 0 && x.title_in_lyric_match < 70)		
			}
		},
		queryFn: () => getLyrics(),
    retry: false,
    staleTime: 1000000, // 16 min
  })
}

export function useLeaderboardData(filter: string) {

	return useQuery({
		queryKey: ['leaderboard'], 
		select: (data) => {
			return filter == 'all' ? data.filter(x=> x.game_mode != 'album') : data.filter(x=> x.game_mode == 'album')
		},
		queryFn: () => getLeaderboard(),
    retry: false, 
    staleTime: 1000000, // 16 min
  })

}

export function spotifyFilteredData(brushRange: BrushRange, ) {

	const screenSize = useScreenSize()

	const h = screenSize.width > 420 ? 600 : 460
	const w = screenSize.width > 420 ? 600 : 420
	const margin = 30
	const marginBottom = 45
	const marginTop = 36
	const marginLeft = 60
	const marginRight = 15

	const { data: spotifyDataFull, isPending: pendingSpotify, error: spotifyError } = useQuery({
		queryKey: ['getSpotifyPlays'], 
		select: (data) => {
	
			let xInvScale = d3.scaleLinear().domain([marginLeft, w - marginRight]).range([Math.min(...data.map(x=> x.song_accuracy)), Math.max(...data.map(x=> x.song_accuracy))])					
			
			let yInvScale = d3.scaleLinear().domain([marginTop, h - marginBottom]).range([Math.max(...data.map(x=> x.historical_counts)), Math.min(...data.map(x=> x.historical_counts))])
	
			return brushRange.x0 ? data.filter(x=> x.song_accuracy >= xInvScale(brushRange.x0 || 0) && x.song_accuracy <= xInvScale(brushRange.x1 || 0) && x.historical_counts <= yInvScale(brushRange.y0 || 0) && x.historical_counts >= yInvScale(brushRange.y1 || 0)) : data
	
		},
		queryFn: () => getSpotifyPlays(), 
		staleTime: 1000 * 3600 * 24, // 1 day
	})
	
	// not sure why but need to make a copy of the data here 
	const spotifyData = [...spotifyDataFull || []]
	
	let xScale = d3.scaleLinear().domain([Math.min(...spotifyData.map(x=> x.song_accuracy)), Math.max(...spotifyData.map(x=> x.song_accuracy))]).range([marginLeft, w - marginRight])
	
	let yScale = d3.scaleLinear().domain([Math.max(...spotifyData.map(x=> x.historical_counts)), Math.min(...spotifyData.map(x=> x.historical_counts))]).range([marginTop, h - marginBottom])
	
	let xInvScale = d3.scaleLinear().domain([marginLeft, w - marginRight]).range([Math.min(...spotifyData.map(x=> x.song_accuracy)), Math.max(...spotifyData.map(x=> x.song_accuracy))])					
		
	let yInvScale = d3.scaleLinear().domain([marginTop, h - marginBottom]).range([Math.max(...spotifyData.map(x=> x.historical_counts)), Math.min(...spotifyData.map(x=> x.historical_counts))])



}
