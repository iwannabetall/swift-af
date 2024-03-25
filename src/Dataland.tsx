// import { useState, useEffect, MouseEvent } from 'react'
import { useState, useEffect, useRef } from 'react'
import title from '/title.svg'
import axios from 'axios';
import Nav from './Nav.tsx'
import * as d3 from 'd3';
import Loader from './Loader.tsx';
import useScreenSize from './useScreenSize.tsx';
import LyricalVizLegend from './LyricalVizLegend.tsx';

// import moment from 'moment';

var lyricStats: LyricData[] = []   //unique list of lyrics w/speed/accuracy stats

var fullLyricsNStats: LyricData[] = []  // lyrics for a song with accuracy/speed but not unique list of lyrics 
var songsFullDB: SongList[] = [] // all songs 
var spotify_full_data: SpotifyData[] = []

function Dataland() {	

	// const accuracy_filter = 95;  // for the initial view, have min 95 accuracy;
	// const ltErasColors = ['eras_green', 'eras_gold', 'eras_purple', 'eras_lblue', 'eras_pink', 'eras_maroon', 'eras_indigo', 'eras_tan', 'eras_grey', 'eras_black'];

	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights'} as const

	const albumKeyLkup = { "Taylor Swift" : "Taylor_Swift", "Fearless" : "Fearless", "Speak Now" : "Speak_Now", 'Red' : 'Red', '1989' : '1989', 'reputation' : 'reputation', 'Lover' : 'Lover', 'folklore' : 'folklore', 'evermore' : 'evermore', 'Midnights' : 'Midnights'} as const

	const albumCovers = ["imtheproblem", "Taylor_Swift", "Fearless", "Speak_Now", "Red", "1989", "reputation", "Lover", "folklore", "evermore", "Midnights"] as const
	
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
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const [songList, setSongList] = useState<SongList[]>([])
	const [gettingLyrics, setGettingLyrics] = useState<boolean>(false)
	const [top40, setTop40] = useState<LyricData[]>([])
	const [showTop40, setShowTop40] = useState<boolean>(true)
	const [spotifyData, setSpotifyData] = useState<SpotifyData[]>([])
	const screenSize = useScreenSize()


	function formatBigNumber(num: number) {
		// already in millions 
		if(num < 1000){
				return (num).toFixed(1) + 'M'; // convert to K for number from > 1000 < 1 million 
		} else if(num > 1000){
			return (num/1000).toFixed(1) + 'Bn'; // convert to M for number from > 1 B 
		}
	}
	
	useEffect(() => {

			// ['http://localhost:3000/getSongs', 'http://localhost:3000/getSpotifyPlays', 'http://localhost:3000/getLyricStats']

		setIsLoading(true)	

		Promise.all([fetch('https://swift-api.fly.dev/getSongs'),
		fetch('https://swift-api.fly.dev/getSpotifyPlays'),
		fetch(`https://swift-api.fly.dev/getLyricStats`)])
		.then(responses => {
			// can return a promise from .json() (which takes a response stream and reads it to completion) and chain another then for that return value or await for it to return data
			return Promise.all(responses.map(res=> res.json()))
					
		})
		.then(([r1, r2, r3])=> {
			songsFullDB = r1.songList
			
			spotify_full_data = r2.spotify_plays
			setSpotifyData(spotify_full_data)

			lyricStats = r3.lyricStats
			setTop40(lyricStats.filter(x => x.total >= 25 && x.accuracy >= 96).slice(0, 40))

			setIsLoading(false)
		})
		.catch(error => {
			console.log(error);
		});
	
	}, [])


	// SPOTIFY VIZ VS ACCURACY SCATTERPLOT
	useEffect(()=> {
		d3.selectAll('.spotify').remove()
		// spotify - accuracy scatter plot
		const t = d3.transition()
			.duration(1500)
			.delay((_, i) => i * 500)
			.ease(d3.easeBounceOut);		

		const h = screenSize.width > 420 ? 680 : 460
		const w = screenSize.width > 420 ? 600 : 420
		const fontSize = screenSize.width > 420 ? '20px' : '18px'
		const margin = 30
		const marginBottom = 45
		const marginTop = 36
		const marginLeft = 60
		const marginRight = 15
		
		let xScale = d3.scaleLinear().domain([Math.min(...spotifyData.map(x=> x.song_accuracy)), Math.max(...spotifyData.map(x=> x.song_accuracy))]).range([marginLeft, w - marginRight])

		let yScale = d3.scaleLinear().domain([Math.max(...spotifyData.map(x=> x.historical_counts)), Math.min(...spotifyData.map(x=> x.historical_counts))]).range([marginTop, h - marginBottom])


		let xInvScale = d3.scaleLinear().domain([marginLeft, w - marginRight]).range([Math.min(...spotifyData.map(x=> x.song_accuracy)), Math.max(...spotifyData.map(x=> x.song_accuracy))])					
				
		let yInvScale = d3.scaleLinear().domain([marginTop, h - marginBottom]).range([Math.max(...spotifyData.map(x=> x.historical_counts)), Math.min(...spotifyData.map(x=> x.historical_counts))])
	
	
		let scatter = d3.select("#spotifyscatter").append('svg')
			.attr('class', 'spotify')
			.attr('height', h)
			.attr('width', w)
			.attr("viewBox", `0 0 ${h} ${w}`)	
		
		const brush = d3.brush().on("end", ({selection}) => {
			if (selection) {
				const [[x0, y0], [x1, y1]] = selection;			
				// console.log(selection)					

				let selectedData = spotify_full_data.filter(x=> x.song_accuracy >= xInvScale(x0) && x.song_accuracy <= xInvScale(x1) && x.historical_counts <= yInvScale(y0) && x.historical_counts >= yInvScale(y1))

				if (selectedData.length > 0) {
					// // y1 is further up (larger than y0)
					setSpotifyData(spotify_full_data.filter(x=> x.song_accuracy >= xInvScale(x0) && x.song_accuracy <= xInvScale(x1) && x.historical_counts <= yInvScale(y0) && x.historical_counts >= yInvScale(y1)))
				}
									
			}
		})
		.extent([[marginLeft-10,0], [w, h-marginBottom + 10]])  // overlay sizing

		//!!!! must create brush before appending bc it overlays a rect that will block mouseover events
		scatter.append('g').attr('class', 'brush')
			.call(brush)
			.on("dblclick", function() {
				setSpotifyData(spotify_full_data)})		

		let spotify = scatter.selectAll<SVGRectElement, SpotifyData>('circle').data(spotifyData, function(d: SpotifyData) {
			return d.song
		})

		// cant seem to get transitions to work with mouseover with joins...so using enter.append			
		spotify.enter().append('circle')
			.attr('class', function(d) { return `${albumColorKey[albumKeyLkup[d.album as keyof typeof albumKeyLkup] as keyof typeof albumColorKey]}`
			})									
			.on('mouseover', function(_, d) {
				// console.log(d3.pointer(e))
				// const startY = d3.pointer(e)[1] - 10//40
				// const xPos = d3.pointer(e)[0] //60

				const startY = -30
				const xPos = screenSize.width < 420 ? 20 : 60		
				
				d3.select('.spotify').append('text')
				.attr('class', 'hoverlabel')
				.attr('x', xPos)
				.attr('y', startY)
				.attr('font-size', fontSize)
				.html(`${d.song}: ${(d.song_accuracy).toFixed(1)}% | ${formatBigNumber(d.historical_counts)} Spotify Plays`)

				d3.select('.spotify').append('text')
				.attr('class', 'hoverlabel')
				.attr('x', xPos)
				.attr('y', startY + 25)
				.attr('font-size', fontSize)
				.text(`${d.top_lyric}`)

				d3.select('.spotify').append('text')
				.attr('class', 'hoverlabel')
				.attr('x', xPos)
				.attr('y', startY + 50)
				.attr('font-size', fontSize)
				.text(`Top Line Avg Stats: ${d.lyrical_accuracy}% | ${d.lyrical_speed}s`)

			})
			.on('mouseout', function(){
				d3.selectAll('.hoverlabel').remove()
			})				
			.attr('cx', 0)  // make bounce look like spray bottle 
			.attr('cy', h)
			.transition(t)
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
				
	}, [spotifyData])
	
// GET ALBUM DATA
	useEffect(()=> {

		// get lyrical stats data either from db or from array we already have
		if (fighter == 'imtheproblem'){
			setShowTop40(true)
		} else {
			// dont have data for particular album, pull from db
			if (fullLyricsNStats.filter(x=> x.album_key == fighter).length == 0){

				setGettingLyrics(true);
				// axios.get(`http://localhost:3000/getFullLyricsNStats`, { params:
				axios.get(`https://swift-api.fly.dev/getFullLyricsNStats`, { params:
				{ 'album': fighter }
				})
				.then(function (response) {								
					fullLyricsNStats = fullLyricsNStats.concat(response.data.fullLyricsNStats)
					// setSongFilter('Anti-Hero')
					console.log('fullLyricsNStats', fullLyricsNStats)
					if (songsFullDB.length > 0) {
						let first_track = songsFullDB.filter(s=> s.album_key == albumFilter)[0].song
						setSongFilter(first_track)
						setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == first_track))
					}
	
					setGettingLyrics(false);
				})
				.catch(function (error) {	
					console.log(error);
				});	
			}
			else {
				// filter lyrics for album 
				console.log('already have lyrics for ', fighter)
				if (songsFullDB.length > 0) {
					let first_track = songsFullDB.filter(s=> s.album_key == albumFilter)[0].song
					setSongFilter(first_track)
					setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == first_track))
				}
			}

		}
		
	}, [fighter])

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

		setDisplayLyrics([])
		setShowTop40(false)
		setFighter(cover);	 
		setAlbumFilter(cover);							
		setSongList(songsFullDB.filter(s=> s.album_key == cover))				
		
	}


	return (
		<>
			<Nav location={location}></Nav>
			{isLoading && <div className='grid grid-cols-1 p-2 justify-items-center mt-20 lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2 justify-center'>
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />	
				</div>
				<Loader/>
			
				</div>}
				{!isLoading && <div className='grid grid-cols-1 p-2 justify-items-center mt-20 lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2 justify-center'>
				
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />				
				</div>	
				
				<div>
					<div className='flex flex-row flex-wrap justify-center' ref={newSongRef}>					
					{albumCovers.map(x=> <img src={`/icons/${x}.jpg`} key={x} className ={`albums ${fighter != x ? 'faded' : fighter == x ? 'selected' : ''}`} onClick={()=> {
						changeViz(x)						
						}}></img>)}					
					</div>	
				</div>

				{<div className='ml-4 mr-4'>					
						{gettingLyrics && <Loader/>}						
				</div>}
						
				{/* legend for album on desktop */}
				{!gettingLyrics && !showTop40 && displayLyrics && 
				screenSize.width >= 828 && <LyricalVizLegend fighter={fighter}/>
				}			

				{/* lyrics data viz by song  */}
				<div className='flex flex-row flex-wrap justify-center'>
					{!gettingLyrics && !showTop40 && displayLyrics && <div>
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

					{!gettingLyrics && !showTop40 && displayLyrics && 
					screenSize.width < 828 && <LyricalVizLegend fighter={fighter}/>
					}							
					
					{showTop40 && <div>	
						<div className='flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p className = 'text-xs'>Jump to: <span className='cursor-pointer font-bold '
							onClick={()=> {
								window.scrollTo({top: spotifyRef.current ? spotifyRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})
								}}>The Story of Us</span> | <span className='cursor-pointer font-bold '
							onClick={()=> window.scrollTo({top: cultSuccessRef.current ? cultSuccessRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> {cultTitle}</span> | <span className='cursor-pointer font-bold '
							onClick={()=> window.scrollTo({top: cultFailRef.current ? cultFailRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}>We Forgot That These Existed</span> </p> </div>							
						<h2 ref={top40Ref}>Long Live the Swiftest Top 40</h2>
						<h5>Most quickly identified lyrics with 96+% accuracy–do you recognize all of them? </h5>
						<h6>Hover over the lyric to reveal the song! Scroll to the end to see the top songs. Lyrics with the title in it were excluded.</h6>						

						<div id='top40VizAns'></div>
						<div id='top40Viz'></div>
						<div className='flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p className = 'text-xs'>Jump to: <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: top40Ref.current ? top40Ref.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> The Swiftest Top 40</span> | <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: cultSuccessRef.current ? cultSuccessRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> {cultTitle}</span> | <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: cultFailRef.current ? cultFailRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> We Forgot That These Existed </span> </p> </div>			
						
						<div className='wrapper'>					
							<h2 id='spotifysection' ref={spotifyRef}>The Story of Us</h2>
							<h6>Are the songs with the most recognized lyrics also the most popular songs? </h6>
							<h6>Hover/click on a circle to see historical Spotify play counts vs accuracy and the top line. Drag and select a region to zoom. Double click on the chart to reset/zoom out.</h6>
							
							<div id='spotifyscatter' ref={spotifyViz}></div>

							<div className='jumpbox flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p className = 'text-xs'>Jump to: <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: top40Ref.current ? top40Ref.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> The Swiftest Top 40</span> | <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: cultFailRef.current ? cultFailRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> We Forgot That These Existed </span> </p> </div>	
						</div>
						
						{/* CULT MODE DATA VIZ - PASSES/SUCCESS */}

						<div className='wrapper'>
							<h2 ref={cultSuccessRef}>{cultTitle}</h2>
							<h6>long story short, it was not a bad time. Cult mode was meant as a joke...and yet top 25 had 65%+ accuracy with the top 5 over 90%...</h6>		
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
							<h6>The under 20 percent-ers</h6>
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
						<div className='wrapper'>
						
							
						</div>

					</div>}

					{!showTop40 && <div>
						<div id='lyricalViz' ref={scrollRef}></div>
						<div className='flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p><span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: newSongRef.current ? newSongRef.current?.offsetTop - 20: 0, behavior: 'smooth'})}> Jump to top for another song! </span> </p> </div>	
					</div>}
					
				</div>
					
				
				
			</div>}
		</>
	)

}

export default Dataland

