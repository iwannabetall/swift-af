// import { useState, useEffect, MouseEvent } from 'react'
import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import axios from 'axios';
import * as d3 from 'd3';
import Loader from './Loader.tsx';
import useScreenSize from './useScreenSize.tsx';
import LyricalVizLegend from './LyricalVizLegend.tsx';
import Layout from './Layout.tsx';
import * as TS from './Constants.tsx'
import { getFullLyricsNStats, getLyricStats, getSongs, getSpotifyPlays } from './data/api.ts';
import { useQuery } from "@tanstack/react-query";


function Dataland() {	

	const albumColorKey = TS.albumColorKey

	const albumKeyLkup = TS.albumKeyLkup

	const albumCovers = ["imtheproblem", "Taylor_Swift", "Fearless", "Speak_Now", "Red", "1989", "reputation", "Lover", "folklore", "evermore", "Midnights", "TTPD"] as const
	
	const cultTitle = "The OH-ment I Knew" as const

	const scrollRef = useRef<HTMLInputElement | null>(null)
	const spotifyRef = useRef<HTMLInputElement | null>(null)
	const spotifyViz = useRef<HTMLInputElement | null>(null)
	const top40Ref = useRef<HTMLInputElement | null>(null)
	const cultFailRef = useRef<HTMLInputElement | null>(null)
	const cultSuccessRef = useRef<HTMLInputElement | null>(null)
	const newSongRef = useRef<HTMLInputElement | null>(null)
	
	const [fighter, setFighter] = useState<AlbumArt>('imtheproblem')
	
	const [albumFilter, setAlbumFilter] = useState<AlbumArt>('imtheproblem')
	const [songFilter, setSongFilter] = useState<string>('')
	const [displayLyrics, setDisplayLyrics] = useState<LyricData[]>([])

	const [songList, setSongList] = useState<SongList[]>([])
	const [gettingLyrics, setGettingLyrics] = useState<boolean>(false)
	const [showTop40, setShowTop40] = useState<boolean>(true)
	const [scatterHighlight, setScatterHighlight] = useState<AlbumArt>('imtheproblem')	
	const screenSize = useScreenSize()

	const [brushRange, setBrushRange] = useState<BrushRange>({x0: undefined, y0: undefined, x1: undefined, y1: undefined})


	const h = screenSize.width > 420 ? 600 : 460
	const w = screenSize.width > 420 ? 600 : 420
	const fontSize = screenSize.width > 420 ? '20px' : '18px'

	const margin = TS.margin
	const marginBottom = TS.marginBottom
	const marginTop = TS.marginTop
	const marginLeft = TS.marginLeft
	const marginRight = TS.marginRight
	
	
	function formatBigNumber(num: number) {
		// already in millions 
		if(num < 1000){
				return (num).toFixed(1) + 'M'; // convert to K for number from > 1000 < 1 million 
		} else if(num > 1000){
			return (num/1000).toFixed(1) + 'Bn'; // convert to M for number from > 1 B 
		}
	}

	// pull data w/usequery -- like use effect and state all in one
	
	const { data: songDataFull, isPending: pendingSongs, error: songError} = useQuery({
				queryKey: ['getSongs'], 
				queryFn: () => getSongs(),
			})

	const songsFullDB = songDataFull || []
	
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

	// NOTE not sure why but need to make a copy of the data here so that we dont get infinite rerenders of the chart and for the plot to show the dots on initial load 
	const spotifyData = [...spotifyDataFull || []]

	let xScale = d3.scaleLinear().domain([Math.min(...spotifyData.map(x=> x.song_accuracy)), Math.max(...spotifyData.map(x=> x.song_accuracy))]).range([marginLeft, w - marginRight])

	let yScale = d3.scaleLinear().domain([Math.max(...spotifyData.map(x=> x.historical_counts)), Math.min(...spotifyData.map(x=> x.historical_counts))]).range([marginTop, h - marginBottom])

	let xInvScale = d3.scaleLinear().domain([marginLeft, w - marginRight]).range([Math.min(...spotifyData.map(x=> x.song_accuracy)), Math.max(...spotifyData.map(x=> x.song_accuracy))])					
			
	let yInvScale = d3.scaleLinear().domain([marginTop, h - marginBottom]).range([Math.max(...spotifyData.map(x=> x.historical_counts)), Math.min(...spotifyData.map(x=> x.historical_counts))])


	//unique list of lyrics w/speed/accuracy stats
	const { data: lyricStatsFull, isPending: pendingLyrics, error: lyricsError} =	useQuery({
			queryKey: ['getLyricStats'], 
			queryFn: () => getLyricStats(),
			staleTime: 1000 * 3600 * 24, // 1 day
		})

	const lyricStats = lyricStatsFull || []

	const top40 = lyricStats.filter(x => x.total >= 25 && x.accuracy >= 96).slice(0, 40)
	
	// lyrics for a song with accuracy/speed but not unique list of lyrics 
	const { data: fullLyricsNStatsDB, isPending: pendingLyricsNStats, error: lyricsNStatsError } = useQuery({
		queryKey: ['fullLyricsNStats', fighter],
		queryFn: () => getFullLyricsNStats(fighter),
		staleTime: 1000 * 3600 * 24, // 1 day
	})

	let fullLyricsNStats = fullLyricsNStatsDB || []

	useEffect(()=> {
		// for the display of lyrical accuracy by album/song, need to filter the data after but avoid infinite renders
		if (fullLyricsNStats && songsFullDB && albumFilter != 'imtheproblem'){
			let first_track = songsFullDB.filter(s=> s.album_key == albumFilter)[0].song
			setSongFilter(first_track)
			setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == first_track))
		}
		// dont have song filter as a dependecy or itll never show a diff song 
	}, [albumFilter, pendingLyricsNStats, pendingSongs])

			
	

	// SPOTIFY VIZ VS ACCURACY SCATTERPLOT
	useEffect(()=> {

		d3.selectAll('.spotify').remove()

		// spotify - accuracy scatter plot
		// const t = d3.transition()
		// 	.duration(1500)
		// 	.delay((_, i) => i * 500)
		// 	.ease(d3.easeBounceOut);	
	
	
		let scatter = d3.select('#spotifyscatter').append('svg')
			.attr('class', 'spotify')
			.attr('height', h)
			.attr('width', w)
			.attr("viewBox", `0 0 ${h} ${w}`)	

		// console.log('scatter', scatter)
		
		const brush = d3.brush().on("end", ({selection}) => {

			// setScatterHighlight('')
			d3.selectAll('.hoverlabel').remove()
			d3.selectAll('.tooltip').remove()
			
			if (selection) {
				const [[x0, y0], [x1, y1]] = selection;			

				let selectedData = spotifyDataFull?.filter(x=> x.song_accuracy >= xInvScale(x0) && x.song_accuracy <= xInvScale(x1) && x.historical_counts <= yInvScale(y0) && x.historical_counts >= yInvScale(y1)) || []

				if (selectedData.length > 0) {
					setBrushRange({x0: x0, y0: y0, x1: x1, y1: y1})
					// // y1 is further up (larger than y0)
				}
									
			}
		})		
		.extent([[marginLeft-10,0], [w, h-marginBottom + 10]])  // overlay sizing

		//NOTE !!!! must create brush before appending bc it overlays a rect that will block mouseover events
		scatter.append('g').attr('class', 'spotify brush')
			.call(brush)
			.on("dblclick", function() {
				setBrushRange({x0: undefined, y0: undefined, x1: undefined, y1: undefined})
			})		

		let spotify = scatter.selectAll<SVGCircleElement, SpotifyData>('circle').data(spotifyData, function(d: SpotifyData) {
			return d.song
		})		
		
		// cant seem to get transitions to work with mouseover with joins...so using enter.append			
		spotify.enter().append('circle')
			.attr('class', function(d) { return `${albumColorKey[albumKeyLkup[d.album as keyof typeof albumKeyLkup] as keyof typeof albumColorKey]} ${scatterHighlight == 'imtheproblem' ? '' : scatterHighlight == albumKeyLkup[d.album as keyof typeof albumKeyLkup] ? '' : 'v-faded'}	`
			})									
			.on('mouseover', function(event, d) {

				// console.log(d.album)
				// setScatterHighlight(d.album)				
				const startY = -40
				const xPos = screenSize.width < 420 ? 10 : 60		
				
				if (screenSize.width < 600) {
					// if mobile, tool tip goes off page
					d3.select('.spotify').append('text')
					.attr('class', 'hoverlabel')
					.attr('x', xPos)
					.attr('y', startY)
					.attr('font-size', fontSize)
					.html(`${d.song}: ${(d.song_accuracy).toFixed(1)}% | ${formatBigNumber(d.historical_counts)} Plays`)
	
					d3.select('.spotify').append('text')
					.attr('class', 'hoverlabel')
					.attr('x', xPos)
					.attr('y', startY + 25)
					.attr('font-size', fontSize)
					.text(`Most Recognized Lyric:`)
	
					d3.select('.spotify').append('text')
					.attr('class', 'hoverlabel')
					.attr('x', xPos)
					.attr('y', startY + 50)
					.attr('font-size', fontSize)
					.text(`${d.top_lyric}`)

				} else {

					d3.selectAll('.tooltip').remove()
					
					var	tooltip = d3
						.select('body')
						.append('g')
							.attr('class', 'tooltip')
						.append('div')
						.style('width', '320px')
						.attr('class', 'd3-tooltip')
						.style('position', 'absolute')
						.style('z-index', '10')
						// .style('visibility', 'hidden')
						.style('padding', '10px')
						.style('background', 'rgba(0,0,0,0.6)')
						.style('border-radius', '4px')
						.style('color', '#fff')

				tooltip
					.style('top', `${event.pageY + 10}px`)
					.style('left', `${event.pageX + 10}px`)
					.html(
						`<div>${d.song}: ${(d.song_accuracy).toFixed(1)}% | ${formatBigNumber(d.historical_counts)} Plays</div>
						<div>Top Lyric: ${d.top_lyric}</div>`
					)
					// .style('visibility', 'visible');
 
				}			
							
			})		
			.on('mouseout', function(){
				d3.selectAll('.hoverlabel').remove()
				d3.selectAll('.tooltip').remove()
				// setScatterHighlight('')
			})				
			// .attr('cx', 0)  // make bounce look like spray bottle 
			// .attr('cy', h)
			// .transition(t)
			.attr('r', '6')				
			.attr('cy', function(d){					
				return yScale(d.historical_counts)
			})
			.attr('cx', function(d){					
				return xScale(d.song_accuracy)
			})
		
		d3.select('.spotify').append('g')
			.attr('class', 'spotify-xaxis')
			.attr('transform', `translate(0, ${h - margin})`)
			// .call(xAxisGen, xScale)				
			.call(d3.axisBottom(xScale))
			.call(g=> g.append('text')
				.attr('y', 27)
				.attr('x', w/2)
				.attr('font-size', '12px')
				.style('fill', 'black')  // fill defaults to none w/axis generator 
				.text('Accuracy'))
			
		//y axis 
		d3.select('.spotify').append('g')
			.attr('class', 'spotify-yaxis')
			.attr('transform', `translate(${1.7*margin}, 0)`)			
			.call(d3.axisLeft(yScale))
			.call(g=> g
				.append('text')
				.attr('x', -26)
				.attr('y', 25)
				.attr("text-anchor", "middle")
				.attr('font-size', '12px')
				.style('fill', 'black')
				.text('Spotify'))
			.call(g=> g
				.append('text')
				.attr('x', -26)
				.attr('y', 40)
				.attr("text-anchor", "middle")
				.attr('font-size', '12px')
				.style('fill', 'black')
				.text('Plays'))
			.call(g=> g
				.append('text')
					.attr('x', -26)
					.attr('y', 54)
					.attr("text-anchor", "middle")
					.attr('font-size', '12px')
					.style('fill', 'black')
					.text('(Millions)')
			)
		
				
	}, [spotifyViz.current, showTop40, spotifyData, pendingSpotify, scatterHighlight])
	


	// TOP/BOTTOM/CULT 40 VIZ
	useEffect(() => {
		// console.log(top40)
		const bounce = d3.transition()
		.duration(1500)
		.ease(d3.easeBounce);
	
		// TOP 40 VIZ
		let top40chartSongs = d3.select('#top40VizAns')
		
		var top40Songs = top40chartSongs
			.selectAll<SVGRectElement, LyricData>('rect').data(top40, function(d: LyricData) {
			return d.lyric_id
		})
		
		top40Songs.enter().append('rect')
			.attr('class', function (d: LyricData) { return `ans ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})					
			.transition(bounce)
			.attr('x', 20)			
			.attr('y', function(_, i: number) { 
				return i * 20 + 30})
			.style('width', 400)
			// .style('height', '100%')
			.style('height', function(d: LyricData){
				if (screenSize.width < 400) {
					if (d.lyric.length > 51){
						// need two rows for long lines, can't use height to 100% if want any transitions tho
						return '54px'  
					} else {
						return '30px'
					}
				} else {
					if (d.lyric.length > 53){
						// need two rows for long lines, can't use height to 100% if want any transitions tho
						return '54px'  
					} else {
						return '30px'
					}
				}
				
			})
			.style("overflow-x", "visible") // Allow text overflow			
			.text(function(d: LyricData) { return d.song })
		

		let top40chart = d3.select('#top40Viz')
		
		var top40lines = top40chart
			.selectAll<SVGRectElement, LyricData>('rect').data(top40, function(d: LyricData) {
			return d.lyric_id
		})

		top40lines.enter().append('rect')			
			.attr('class', function (d: LyricData) { return `top40Lyrics ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})	
			// .on('mouseover', function(d) { console.log(d)})
			.transition(bounce)							
			.attr('x', 20)			
			.attr('y', function(_, i: number) { 
				return (i * 20 + 30)})			
			.style('width', 400)
			// .style('height', '100%')
			.style('height', function(d: LyricData){
				if (screenSize.width < 400) {
					if (d.lyric.length > 51){
						// need two rows for long lines, can't use height to 100% if want any transitions tho
						return '54px'  
					} else {
						return '30px'
					}
				} else {
					if (d.lyric.length > 53){
						// need two rows for long lines, can't use height to 100% if want any transitions tho
						return '54px'  
					} else {
						return '30px'
					}
				}
			})
			.style("overflow-x", "visible") // Allow text overflow			
			.text(function(d: LyricData) { return d.lyric })

		
		// CULT TOP 40 -- filter for highest accuracy 
		let cultTop40Data = lyricStats.filter(x=> x.total > 20 && x.filler == 1).sort((a,b) => b.accuracy - a.accuracy).slice(0, 25)
		
		let cultTop40ChartSongs = d3.select('#cultTop40VizAns')
		
		let cultTop40Songs = cultTop40ChartSongs.selectAll<SVGRectElement, LyricData>('rect').data(cultTop40Data, function(d: LyricData){
			return d.lyric_id
		})
		
		cultTop40Songs.join(enter => 
			enter.append('rect')
			.attr('class',function (d: LyricData) { return `ans ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})
			.attr('x', 20)			
			.attr('y', function(_, i: number) { 
				return i * 20 + 30})
			.style('width', 400)
			// .style('height', '100%')
			.style('height', function(d: LyricData){
				if (d.lyric.length > 53){
					// need two rows for long lines, can't use height to 100% if want any transitions tho
					return '54px'  
				} else {
					return '30px'
				}
			})
			.style("overflow-x", "visible") // Allow text overflow			
			.text(function(d: LyricData) { return d.song })		
		)

		let cultTop40chart = d3.select('#cultTop40Viz')
		
		var cultTop40lines = cultTop40chart
			.selectAll<SVGRectElement, LyricData>('rect').data(cultTop40Data, function(d: LyricData) {
			return d.lyric_id
		})

		cultTop40lines.join(enter=> (
			enter.append('rect')
			.attr('class', function (d: LyricData) { return `cultTop40Lyrics ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})					
			.attr('x', 20)			
			.attr('y', function(_, i: number) { 
				return (i * 20 + 30)})
			.style('width', 400)
			// .style('height', '100%')
			.style('height', function(d: LyricData){
				if (d.lyric.length > 53){
					// need two rows for long lines, can't use height to 100% if want any transitions tho
					return '54px'  
				} else {
					return '30px'
				}
			})
			.style("overflow-x", "visible") // Allow text overflow			
			.text(function(d: LyricData) { return d.lyric })
		)) 
		
		
		// BOTTOM 40 DATA VIZ

		let bottom40Data = lyricStats.filter(x=> x.total > 25 && x.accuracy < 25).sort((a, b) => b.accuracy - a.accuracy).slice(0,20)

		let bottom40ChartSongs = d3.select('#bottom40VizAns')
		let bottom40Songs = bottom40ChartSongs.selectAll<SVGRectElement, LyricData>('rect').data(bottom40Data, function(d: LyricData){
			return d.lyric_id
		})
		
		bottom40Songs.join(enter => 
			enter.append('rect')
			.attr('class',function (d: LyricData) { return `ans ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})
			.attr('x', 20)			
			.attr('y', function(_, i: number) { 
				return i * 20 + 30})
			.style('width', 400)
			// .style('height', '100%')
			.style('height', function(d: LyricData){
				if (d.lyric.length > 53){
					// need two rows for long lines, can't use height to 100% if want any transitions tho
					return '54px'  
				} else {
					return '30px'
				}
			})
			.style("overflow-x", "visible") // Allow text overflow			
			.text(function(d: LyricData) { return d.song })		
		)

		let bottom40chart = d3.select('#bottom40Viz')
		
		var bottom40lines = bottom40chart
			.selectAll<SVGRectElement, LyricData>('rect').data(bottom40Data, function(d: LyricData) {
			return d.lyric_id
		})

		bottom40lines.join(enter=> (
			enter.append('rect')
			.attr('class', function (d: LyricData) { return `bottom40Lyrics ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})					
			.attr('x', 20)			
			.attr('y', function(_, i: number) { 
				return (i * 20 + 30)})
			.style('width', 400)
			// .style('height', '100%')
			.style('height', function(d: LyricData){
				if (d.lyric.length > 53){
					// need two rows for long lines, can't use height to 100% if want any transitions tho
					return '54px'  
				} else {
					return '30px'
				}
			})
			.style("overflow-x", "visible") // Allow text overflow			
			.text(function(d: LyricData) { return d.lyric })
		)) 
		
			
	}, [top40, showTop40])

	// LYRICAL WORD CLOUD VIZ
	useEffect(() => {
		// lyrical data viz 
		
		if (displayLyrics.length > 0) {			

			d3.selectAll('.lyrics').remove()

			let lyrics_viz = d3.select('#lyricalViz').append('g.lyrics')
			let lyrics = lyrics_viz.selectAll<SVGElement, LyricData>('svg').data(displayLyrics, function(d: LyricData) { return d.lyric})

			lyrics.enter().append('text')
				.attr('class', function (d: LyricData) { 
					return `lyrics ${albumColorKey[d.album_key as keyof typeof albumColorKey]}-${d.accuracy_group}`					
				})
				.attr('x', 20)
				.attr('y', function(_, i: number) { 
					return i * 20 + 30})			
				.attr("text-anchor", "start")
				.style("overflow-x", "visible") // Allow text overflow
				.text(function(d: LyricData) { return d.lyric })					
			
	} else {
		// remove data 
		d3.selectAll('.top40Lyrics').remove()
		d3.selectAll('.lyrics').remove()

	}

	}, [displayLyrics, albumFilter])


	function changeViz(cover: AlbumArt){
		d3.selectAll('.lyrics').remove()

		if (cover == 'imtheproblem'){			
			setShowTop40(true)
		} else {
			setShowTop40(false)
		}
		setDisplayLyrics([])
		console.log(cover)
		setFighter(cover);	 
		setAlbumFilter(cover);							
		setSongList(songsFullDB.filter(s=> s.album_key == cover))				
		
	}


	return (
		<>			
			<Layout isLoading={(pendingLyrics)}>
				<div>
					<div className='flex flex-row flex-wrap justify-center' ref={newSongRef}>					
					{albumCovers.map(x=> <img src={`/icons/${x}.jpg`} key={x} className ={`albums ${fighter != x ? 'faded' : fighter == x ? 'selected' : ''}`} onClick={()=> {
						changeViz(x)						
						}}></img>)}					
					</div>	
				</div>
					
					
				{<div className='ml-4 mr-4'>			
						{/* loader for pulling lyrics for album data viz */}
						{(pendingLyricsNStats && !showTop40) && <Loader/>}						
				</div>}
						
				{/* legend for album on desktop */}
				{!pendingLyricsNStats && !showTop40 && displayLyrics && 
				screenSize.width >= 828 && <LyricalVizLegend fighter={fighter}/>
				}			

				{/* lyrics data viz by song  */}
				<div className='flex flex-row flex-wrap justify-center'>
					{!pendingLyricsNStats && !showTop40 && displayLyrics && <div>
						{songList.map((x)=> 
						<div onClick={() => { 
							setSongFilter(x.song);
							setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == x.song));
							// scroll to top of data viz, buffer for nav bar on mobile
							if (screenSize.width < 828) {
								// scroll to top of legend on mobile
								window.scrollTo({top: scrollRef.current ? scrollRef.current?.offsetTop - 175 : 0, behavior: 'smooth'})							
							} else{
								window.scrollTo({top: scrollRef.current ? scrollRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})							
							}
							
						}}
						className={`cursor-pointer rounded-t-xl rounded-b-xl text-center m-2 p-1 pl-3 pr-3 text-m font-bold ${albumColorKey[x.album_key as keyof typeof albumColorKey]} ${songFilter == x.song ? 'selected' : 'faded'}`}
						key={`${x.song}`}
							>{x.song}</div>)}
					</div>}	

					{!showTop40 && displayLyrics && 
					screenSize.width < 828 && <LyricalVizLegend fighter={fighter}/>
					}							
					
					{showTop40 && <div>
						<div className='flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p className = 'text-xs'>Jump to: <span className='cursor-pointer font-bold '
							onClick={()=> {
								window.scrollTo({top: spotifyRef.current ? spotifyRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})
								}}>The Story of Us</span> | <span className='cursor-pointer font-bold '
							onClick={()=> window.scrollTo({top: cultSuccessRef.current ? cultSuccessRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> {cultTitle}</span> | <span className='cursor-pointer font-bold '
							onClick={()=> window.scrollTo({top: cultFailRef.current ? cultFailRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}>We Forgot That These Existed</span> </p> </div>							
						{/* <h2 ref={top40Ref}>Long Live the Swiftest Top 40</h2> */}
						<h2 ref={top40Ref}>It's me, hi, Taylor Swift. I made the Swiftest Top 40</h2>
						<h5>Most quickly identified lyrics with 96+% accuracy–do you recognize all of them? </h5>
						<h6>Hover over the lyric to reveal the song! </h6>						

						<div id='top40VizAns'></div>
						<div id='top40Viz'></div>
						<div className='flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p className = 'text-xs'>Jump to: <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: top40Ref.current ? top40Ref.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> The Swiftest Top 40</span> | <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: cultSuccessRef.current ? cultSuccessRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> {cultTitle}</span> | <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: cultFailRef.current ? cultFailRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> We Forgot That These Existed </span> </p> </div>			
						
						<div className='wrapper'>					
							<h2 id='spotifysection' ref={spotifyRef}>The Story of Us</h2>
							<h6>Are the songs with the most recognized lyrics also the most popular songs? </h6>
							<h6>Drag and select a region to zoom. Double click on the chart to reset/zoom out.</h6>
							<h6>Hover/click on a circle to see historical Spotify play counts vs overall song accuracy and the top line. {screenSize.width >= 600 && <span>Click an album to highlight its songs.</span>}</h6>
							

							<p className='text-center text-xs'>Filler lines and lines with the title in it excluded. Spotify data as of March 17, 2024. {screenSize.width < 600 && <span>More filters available on a desktop.</span>}</p>
							
							
							<div className='spotifyscatter-wrapper' >

								{screenSize.width >= 600 && <div className='flex flex-col flex-wrap justify-center' ref={newSongRef}>					
								{albumCovers.filter(x=> x != 'TTPD').map(x=> <img src={`/icons/${x}.jpg`} key={x} className ={`sm-albums ${scatterHighlight != x ? 'faded' : scatterHighlight == x ? 'selected' : ''}`} onClick={()=> {
									setScatterHighlight(x)
									}}></img>)}					
								</div>	}
								
								<div id='spotifyscatter' ref={spotifyViz}></div>

							</div>
							<div className='jumpbox flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p className = 'text-xs'>Jump to: <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: top40Ref.current ? top40Ref.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> The Swiftest Top 40</span> | <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: cultFailRef.current ? cultFailRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> We Forgot That These Existed </span> </p> </div>	
						</div>
						
						{/* CULT MODE DATA VIZ - PASSES/SUCCESS */}

						<div className='wrapper'>
							<h2 ref={cultSuccessRef}>{cultTitle}</h2>
							<h6>long story short, it was not a bad time. Cult mode was meant as a joke...and yet top 25 had 65%+ accuracy with the top 5 over 90%...</h6>
							<h5>Tap the line to see how many can you get right!</h5>
							<div id='cultTop40VizAns'>							
							</div>
							<div id='cultTop40Viz'>
							</div>
							<div className='flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p className='text-xs'>Jump to: <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: top40Ref.current ? top40Ref.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> The Swiftest Top 40</span> | <span className='font-bold cursor-pointer'
							onClick={()=> {
								window.scrollTo({top: spotifyRef.current ? spotifyRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})
							}}> The Story of Us </span> </p> </div>
						</div>
						
						{/* CULT MODE DATA VIZ - FAILS */}
						<div className='wrapper'>
							<h2 ref={cultFailRef}>We Forgot That These Existed</h2>
							<h6>The under 20 percent-ers. Those cages were not mental, you should just reveal the answers for these cause it was a set up. 🙃 </h6>
							<div id='bottom40VizAns'>							
							</div>
							<div id='bottom40Viz'>
							</div>
							<div className='flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p className = 'text-xs'>Jump to: <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: top40Ref.current ? top40Ref.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> The Swiftest Top 40</span> | <span className='font-bold cursor-pointer'
							onClick={()=> {
								window.scrollTo({top: spotifyRef.current ? spotifyRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})
								}}> The Story of Us </span> | <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: cultSuccessRef.current ? cultSuccessRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> {cultTitle}</span> </p> </div>
						</div>							

					</div>}

					{!showTop40 && !pendingLyricsNStats && <div>
						<div id='lyricalViz' ref={scrollRef}></div>
						<div className='flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p><span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: newSongRef.current ? newSongRef.current?.offsetTop - 20: 0, behavior: 'smooth'})}> Jump to top for another song! </span> </p> </div>	
					</div>}
					
				</div>
					
				
			</Layout>	
		</>
	)

}

export default Dataland

