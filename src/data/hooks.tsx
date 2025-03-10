import { getSongs, getLyrics, getSpotifyPlays, getUserStats, getLeaderboard } from './api.ts'
import { useQuery } from "@tanstack/react-query";
import * as d3 from 'd3';
import useScreenSize from '../useScreenSize.tsx';
import * as TS from '../Constants.tsx'
import { summarize, tidy } from '@tidyjs/tidy'
// interface Env {
// 	API_KEY: string;
// 	ENVIRONMENT: string;
// }

// export async function onRequest(context) {
//   const KEY = context.env.API_KEY;

//   return new Response(KEY)
// }
const normal = "classics version" as const
const challenging = 'Tortured Classics' as const
const hard = "Taylor's Version" as const
const pro = "The Eras" as const
const expert = 'cult version' as const

const margin = TS.margin
const marginBottom = TS.marginBottom
const marginTop = TS.marginTop
const marginLeft = TS.marginLeft
const marginRight = TS.marginRight


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
    staleTime: 300000, // 5 min
  })

}

export function useGetUserStats(sess_id: string, brushRange: BrushRange, brushRange_ByAlbum: BrushRange) {
	const screenSize = useScreenSize()

	const h = screenSize.width > 420 ? 600 : 460
	const w = screenSize.width > 420 ? 600 : 420

	// const h = 600
	// const w = 600
	//TODO - is this the right query key??  if you pull your stats, play a game, will it update immediately 

	return useQuery({
		queryKey: ['userStats', sess_id],
		select: (data) => {

			// if have more than 5 guessed correctly for a song, go with that song 
			console.log('data', data)
			const songStatsDict: { [k: string]: SongStats } = {}
			
			for (let i = 0; i < data.length; i++) {
				if (Object.keys(songStatsDict).includes(data[i].song)) {
					// get stats by song 
					songStatsDict[data[i].song].total += 1
					
					songStatsDict[data[i].song].accuracy = (data[i].correct + songStatsDict[data[i].song].correct)/songStatsDict[data[i].song].total
					
					songStatsDict[data[i].song].correct = songStatsDict[data[i].song].correct + data[i].correct

					songStatsDict[data[i].song].totalTime = songStatsDict[data[i].song].totalTime + data[i].time

					songStatsDict[data[i].song].avg_time = songStatsDict[data[i].song].totalTime/songStatsDict[data[i].song].total
				

				} else {
					songStatsDict[data[i].song] = {
						album_key: data[i].album_key,
						album: data[i].album,
						song: data[i].song,
						total: 1,
						correct: data[i].correct,
						accuracy: data[i].correct,
						avg_time: data[i].time, 
						totalTime: data[i].time
					}
				}

			}
			
			const songStats: SongStats[] = Object.values(songStatsDict).sort((a: any,b: any) => (b.accuracy - a.accuracy || a.avg_time - b.avg_time))

			console.log('songstats', songStats)
			// get top songs by album 

			let albumStats = d3.rollups(data, v=> {
				return {
					album: v[0].album,
					total: v.length,
					correct: d3.sum(v, d=> d.correct),
					accuracy: Math.round(100*(d3.sum(v, d=> d.correct)/v.length)),
					avg_time: d3.mean(v, d=> d.time)?.toFixed(1) ?? '-',
					correct_time: d3.mean(v.filter(x=> x.correct == 1), d=> d.time) ?? '-',
					wrong_time: d3.mean(v.filter(x=> x.correct == 0), d=> d.time) ?? '-'

				}

			}, d=> d.album_key).sort((a: any,b: any) => (b.accuracy - a.accuracy || a.avg_time - b.avg_time))


			const statsByGameAgg = d3.rollups(data, v=> {
				return {
					date: v[0].game_date,
					game_mode: v[0].game_mode,
					album_mode: v[0].album_mode,						
					total: v.length,
					correct: d3.sum(v, d=> d.correct),
					accuracy: Math.round(100*(d3.sum(v, d=> d.correct)/v.length)),
					avg_time: d3.mean(v, d=> d.time)?.toFixed(1) ?? '-',
					correct_time: v.filter(x=> x.correct == 1).length > 0 ? d3.mean(v.filter(x=> x.correct == 1), d=> d.time) : '-',
					wrong_time: v.filter(x=> x.correct == 0).length > 0 ? d3.mean(v.filter(x=> x.correct == 0), d=> d.time) : '-'

				}

			}, d=> d.game_id)

			// need to flatten 
			const statsByAlbum: AggGameStats[] = []
			for (let i = 0; i < albumStats.length; i++) {
				statsByAlbum.push({...albumStats[i][1], 'album_key': albumStats[i][0]})		
			}

			const statsByGame: AggGameStats[] = []
			for (let i = 0; i < statsByGameAgg.length; i++) {
				statsByGame.push({...statsByGameAgg[i][1], 'game_id': statsByGameAgg[i][0]})		
			}
 
			// if want to have brush feature, need to clean the data here 
			// need to add .getTime to make TS happy bc it will return a number
			let xInvScale = d3.scaleUtc().domain([marginLeft, w - marginRight]).range([Math.min(...statsByGame.map(x=> (new Date(x.date as string)).getTime())), Math.max(...statsByGame.map(x=> (new Date(x.date as string)).getTime()))])				
				
			let yInvScale = d3.scaleLinear().domain([marginTop, h - marginBottom]).range([Math.max(...statsByGame.map(x=> x.accuracy)), Math.min(...statsByGame.map(x=> x.accuracy))])

			const statsByGameFiltered = brushRange.x0 ? statsByGame.filter(x=> (new Date(x.date as string)).getTime() >= xInvScale(brushRange.x0 || 0) && (new Date(x.date as string)).getTime() <= xInvScale(brushRange.x1 || 0) && x.accuracy <= yInvScale(brushRange.y0 || 0) && x.accuracy >= yInvScale(brushRange.y1 || 0)) : statsByGame

			// repeat for by album 
			let xInvScaleByAlbum = d3.scaleUtc().domain([marginLeft, w - marginRight]).range([Math.min(...statsByAlbum.map(x=> parseFloat(x.avg_time))), Math.max(...statsByAlbum.map(x=> parseFloat(x.avg_time)))])				
				
			let yInvScaleByAlbum = d3.scaleLinear().domain([marginTop, h - marginBottom]).range([Math.max(...statsByAlbum.map(x=> x.accuracy)), Math.min(...statsByAlbum.map(x=> x.accuracy))])

			const statsByAlbumFiltered = brushRange_ByAlbum.x0 ? statsByAlbum.filter(x=> parseFloat(x.avg_time) >= xInvScaleByAlbum(brushRange_ByAlbum.x0 || 0) && parseFloat(x.avg_time) <= xInvScaleByAlbum(brushRange_ByAlbum.x1 || 0) && x.accuracy <= yInvScaleByAlbum(brushRange_ByAlbum.y0 || 0) && x.accuracy >= yInvScaleByAlbum(brushRange_ByAlbum.y1 || 0)).sort((a: any,b: any) => (b.accuracy - a.accuracy || a.avg_time - b.avg_time)) : statsByAlbum.sort((a: any,b: any) => (b.accuracy - a.accuracy || a.avg_time - b.avg_time))

			for (let i = 0; i < statsByAlbumFiltered.length; i++) {
				const topSong = songStats.filter(x=> x.album_key == statsByAlbumFiltered[i].album_key && x.total >= 5)

				statsByAlbumFiltered[i].topSong = topSong.length > 0 ? topSong[0].song : ''

				statsByAlbumFiltered[i].topSongStats = topSong.length > 0 ? `${(100*topSong[0].accuracy).toFixed(0)}% (${topSong[0].correct}/${topSong[0].total})` : ''

				statsByAlbumFiltered[i].topSongSpeed = topSong.length > 0 ? topSong[0].avg_time : ''


			}
						
			let fastest = data.filter(x=> x.correct == 1).sort((a,b) => a.time - b.time).slice(0,10)

			return { albumStats: statsByAlbumFiltered, statsByGame: statsByGameFiltered, fastest: fastest, db: data, songStats: songStats}
		},
		queryFn: () => getUserStats(sess_id),
	})
}

export function useSpotifyFilteredData(brushRange: BrushRange, ) {

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
