import { getSpotifyPlays, getLeaderboard } from './api.ts'
import { useQuery } from "@tanstack/react-query";
import * as d3 from 'd3';
import useScreenSize from './useScreenSize.tsx';

export function getLeaderboardData(filter: string) {

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

export async function spotifyFilteredData(brushRange: BrushRange, ) {

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
