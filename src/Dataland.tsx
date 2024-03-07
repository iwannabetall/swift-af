// import { useState, useEffect, MouseEvent } from 'react'
import { useState, useEffect } from 'react'
import title from '/title.svg'
import axios from 'axios';
import Nav from './Nav.tsx'
import * as d3 from 'd3';
 
// import moment from 'moment';

let lyricStats: LyricData[] = []   //unique list of lyrics w/speed/accuracy stats

// 
let fullLyricsNStats: LyricData[] = []  // lyrics for a song with accuracy/speed but not unique list of lyrics 
let songsFullDB: SongList[] = [] // all songs 

function Dataland() {	

	// const accuracy_filter = 95;  // for the initial view, have min 95 accuracy;
	// const ltErasColors = ['eras_green', 'eras_gold', 'eras_purple', 'eras_lblue', 'eras_pink', 'eras_maroon', 'eras_indigo', 'eras_tan', 'eras_grey', 'eras_black'];

	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights'} as const

	// const albumKeyLkup = { "Taylor Swift" : "Taylor_Swift", "Fearless" : "Fearless", "Speak Now" : "Speak_Now", 'Red' : 'Red', '1989' : '1989', 'reputation' : 'reputation', 'Lover' : 'Lover', 'folklore' : 'folklore', 'evermore' : 'evermore', 'Midnights' : 'Midnights'} as const

	const albumCovers = ["imtheproblem", "Taylor_Swift", "Fearless", "Speak_Now", "Red", "1989", "reputation", "Lover", "folklore", "evermore", "Midnights"] as const

	const accuracy_groups = [{key: 'a75-90', text: "75-90% Accuracy"}, {key: 'a55-75', text: "55-75% Accuracy"}, {key: 'u55', text: "Below 55% Accuracy"}] as const

	const [fighter, setFighter] = useState<AlbumArt>('imtheproblem')
	
	const [albumFilter, setAlbumFilter] = useState<AlbumArt>('imtheproblem')
	const [songFilter, setSongFilter] = useState<string>('')
	const [displayLyrics, setDisplayLyrics] = useState<LyricData[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const [songList, setSongList] = useState<SongList[]>([])
	const [gettingLyrics, setGettingLyrics] = useState<boolean>(false)
	const [top40, setTop40] = useState<LyricData[]>([])
	const [showTop40, setShowTop40] = useState<boolean>(true)
	const [highlightGroup, setHighlightGroup] = useState<string>('')

	useEffect(() => {

		delayedDataFetch()
	
	}, [])


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
					console.log(fullLyricsNStats)
					if (songsFullDB.length > 0) {
						let first_track = songsFullDB.filter(s=> s.album_key == albumFilter)[0].song
						setSongFilter(first_track)
						setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == first_track))
						setHighlightGroup('')
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

	useEffect(() => {

		const t = d3.transition()
		.duration(750)
		.ease(d3.easeBounceOut);
		
		let top40chart = d3.select('#top40Viz')

		var top40lines = top40chart
			.selectAll<SVGRectElement, LyricData>('rect').data(top40, function(d: LyricData) {
			return d.lyric
		})

		top40lines.enter().append('rect')
			.attr('class', function (d: LyricData) { return `top40Lyrics ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})		
			.transition(t)
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
			.text(function(d: LyricData) { return d.lyric })
			// .attr("text-anchor", "middle")
			// .attr("dominant-baseline", "middle")
			
	}, [top40, showTop40])

	useEffect(() => {
		// lyrical data viz 
		
		if (displayLyrics.length > 0) {
			console.log(displayLyrics)

			// const t = d3.transition()
			// 	.duration(750)
			// 	.ease(d3.easeLinear);

			d3.selectAll('.lyrics').remove()

			// let lyric_accuracy = displayLyrics.map(x=> x.accuracy)
			// let high = d3.max(lyric_accuracy)
			// let low = d3.min(lyric_accuracy) || 0
		
			// const scaleFilter = d3.scaleLinear([low, high], [0.25, 1])
			// const scaleFontSize = d3.scaleLinear([low, 100], [14, 18])

			let lyrics_viz = d3.select('#lyricalViz').append('g.lyrics')
			let lyrics = lyrics_viz.selectAll<SVGElement, LyricData>('svg').data(displayLyrics, function(d: LyricData) { return d.lyric})

			lyrics.enter().append('text')
				.attr('class', function (d: LyricData) { 
					return `lyrics ${albumColorKey[d.album_key as keyof typeof albumColorKey]} ${(d.title_in_lyric_match || 0) >= 70 || !d.accuracy || d.total < 10 ? 'fadeline' : d.accuracy >= 90 ? 'a90-plus' : d.accuracy > 75 ? 'a75-90' : d.accuracy > 55 ? 'a55-75' : 'u55'}`
				})
				.attr('x', 20)
				.attr('y', function(_, i: number) { 
					return i * 20 + 30})			
				.attr("text-anchor", "start")
				// .attr('dy', )
				.style('font-size', function(d: LyricData) { 
					// for optional params in interface, check to see if title_in_lyric_match exists first
					if ((d.title_in_lyric_match || 0) >= 70 || !d.accuracy || d.total < 10) {
						// console.log(scaleFontSize(d.accuracy))
						return "10px"
					} else if (d.accuracy >= 90) {
						return "20px"
					} else if (d.accuracy > 75) {
						return "17px"
					} else if (d.accuracy > 55) {
						return "14px"
					// } else if (d.accuracy > 60) {
						// return 0.5
					} else {
						return "12px"
					}  
					//  else {
					// 	// console.log(Math.round(scaleFontSize(d.accuracy)))
					// 	return `${Math.round(scaleFontSize(d.accuracy))}px`
					// } 			
				 })
				.style('opacity', function(d: LyricData) { 
					if (d.accuracy >= 90) {
						return 1
					} else if (d.accuracy > 75) {
						return 0.8
					} else if (d.accuracy > 55) {
						return 0.6
					// } else if (d.accuracy > 60) {
						// return 0.5
					} else {
						return 0.45
					} 
				})
				.style('font-weight', function (d: LyricData) {
					// decide what the time/accuracy cutoffs are -- about 350 and 450 bolded respectively w/current 
					// went w/3 seconds bc thats what the fastest averages on the leaderboard were -- avg just under 3s 
					if (d.time < 3.3 && d.accuracy >= 90 && d.total > 10 && (d.title_in_lyric_match || 0) < 70){
						return 700
					} else {
						return 400
					}
					
				})
				.style("overflow-x", "visible") // Allow text overflow
				.text(function(d: LyricData) { return d.lyric })				
				// .on('mouseover', function (d: MouseEvent) {
				// 	console.log(d.target.__data__)			
				// })
			
	} else {
		// remove data 
		d3.selectAll('.top40Lyrics').remove()
		d3.selectAll('.lyrics').remove()

	}

	}, [displayLyrics, albumFilter])

	function highlightLines(lyricGroup: string){
		setHighlightGroup(lyricGroup)

		d3.selectAll('.lyrics').transition()
			.style('opacity', 0.3)

		
		d3.selectAll(`.lyrics.${lyricGroup}`).transition()
			.style('opacity', 1)
	}

	async function delayedDataFetch() {
		
		axios.get(`https://swift-api.fly.dev/getSongs`)
		// axios.get(`http://localhost:3000/getSongs`)
			.then(function (response) {					
				// setSongList(response.data.songList.filter(x => x.album_key == albumFilter))
				songsFullDB = response.data.songList
				console.log(songsFullDB)
			})
			.catch(function (error) {				
				console.log(error);
			});	

		setIsLoading(true)
		// axios.get(`http://localhost:3000/getLyricStats`)
		axios.get(`https://swift-api.fly.dev/getLyricStats`)
		.then(function (response) {								
			lyricStats = response.data.lyricStats
			setTop40(lyricStats.filter(x => x.total > 20 && x.accuracy > 95).slice(0, 40))
			console.log(lyricStats)
			setIsLoading(false)
		})
		.catch(function (error) {				
			console.log(error);
		});	

		// axios.get(`http://localhost:3000/getFullLyricsNStats`)
		// // axios.get(`https://swift-api.fly.dev/getFullLyricsNStats`)
		// .then(function (response) {								
		// 	fullLyricsNStats = response.data.fullLyricsNStats
		// 	setSongFilter('Anti-Hero')
		// 	console.log(fullLyricsNStats)
		// })
		// .catch(function (error) {				
		// 	console.log(error);
		// });	

	}

	function changeViz(cover: AlbumArt){
		d3.selectAll('.lyrics').remove()

		setDisplayLyrics([])
		setShowTop40(false)
		setFighter(cover);	 
		setAlbumFilter(cover);							
		setSongList(songsFullDB.filter(s=> s.album_key == cover))				
		setHighlightGroup('')
		
	}




	return (
		<>
			<Nav location={location}></Nav>
			{isLoading && <div className='grid grid-cols-1 p-2 justify-items-center mt-20 lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2 justify-center'>
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />	
				</div>
				<h2>Wait, don't go. The story of us is coming! </h2></div>}
				{!isLoading && <div className='grid grid-cols-1 p-2 justify-items-center mt-20 lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2 justify-center'>
				
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />				
				</div>	
				
				<div>
					<div className='flex flex-row flex-wrap justify-center'>					
					{albumCovers.map(x=> <img src={`/icons/${x}.jpg`} key={x} className ={`albums ${fighter != x ? 'faded' : fighter == x ? 'selected' : ''}`} onClick={()=> {
						changeViz(x)						
						}}></img>)}					
					</div>	
				</div>

				{<div>					
						{gettingLyrics && 
						<div>
							<h2>Grabbing the Data!</h2>
							<iframe src="/icons/tswift running.gif" width="480" height="200" frameBorder="0" className="giphy-embed" allowFullScreen></iframe><p><a href="/icons/tswift running.gif"></a></p>
						</div>}
						
					</div>}
						
				{/* legend for album */}
				{!gettingLyrics && !showTop40 && displayLyrics && <div className='flex flex-row flex-wrap justify-center'>
					
					<div className={`legend a90-plus ${highlightGroup == 'a90-plus' ? 'underline selected' : '' } ${albumColorKey[fighter as keyof typeof albumColorKey]}`}
						onClick={()=> highlightLines('a90-plus')}
					>90+% Accuracy <span className='font-bold '>& sub-3.3s</span></div>
					{accuracy_groups.map(x => 
						<div className={`legend ${x.key} ${highlightGroup == x.key ? 'underline selected' : '' } ${albumColorKey[fighter as keyof typeof albumColorKey]}`}
							onClick={()=> highlightLines(x.key)}
						>{x.text}</div>)}

				</div>}			

				<div className='flex flex-row flex-wrap justify-center'>
					{!gettingLyrics && !showTop40 && displayLyrics && <div>
						{songList.map((x)=> 
						<div onClick={() => { setSongFilter(x.song);
							setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == x.song));
						}}
						className={`cursor-pointer rounded-t-xl rounded-b-xl text-center m-2 p-1 pl-3 pr-3 text-m font-bold ${albumColorKey[x.album_key as keyof typeof albumColorKey]} ${songFilter == x.song ? 'selected' : 'faded'}`}
						key={`${x.song}`}
							>{x.song}</div>)}
					</div>}					
					
					{showTop40 && <div>
						<h2>Swiftest Top 40</h2>
						<div id='top40Viz'></div>
					</div>}

					{!showTop40 && <div>
						<div id='lyricalViz'></div>
					</div>}
					
				</div>
					
				
				
			</div>}
		</>
	)

}

export default Dataland