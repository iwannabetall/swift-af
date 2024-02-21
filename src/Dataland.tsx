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

	const accuracy_filter = 95;  // for the initial view, have min 95 accuracy;
	const ltErasColors = ['eras_green', 'eras_gold', 'eras_purple', 'eras_lblue', 'eras_pink', 'eras_maroon', 'eras_indigo', 'eras_tan', 'eras_grey', 'eras_black'];

	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights'} as const

	const albumKeyLkup = { "Taylor Swift" : "Taylor_Swift", "Fearless" : "Fearless", "Speak Now" : "Speak_Now", 'Red' : 'Red', '1989' : '1989', 'reputation' : 'reputation', 'Lover' : 'Lover', 'folklore' : 'folklore', 'evermore' : 'evermore', 'Midnights' : 'Midnights'} as const

	const albumCovers = ["imtheproblem", "Taylor_Swift", "Fearless", "Speak_Now", "Red", "1989", "reputation", "Lover", "folklore", "evermore", "Midnights"] as const


	const [fighter, setFighter] = useState<AlbumArt>('imtheproblem')
	
	const [albumFilter, setAlbumFilter] = useState<AlbumKey | ''>('')
	const [songFilter, setSongFilter] = useState<string>('')
	const [displayLyrics, setDisplayLyrics] = useState<LyricData[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const [songList, setSongList] = useState<SongList[]>([])
	const [gettingLyrics, setGettingLyrics] = useState<boolean>(false)
	const [top40, setTop40] = useState<LyricData[]>([])
	const [showTop40, setShowTop40] = useState<boolean>(true)

	useEffect(() => {

		delayedDataFetch()
	
	}, [])


	useEffect(()=> {

		if (fighter == 'imtheproblem'){
			setShowTop40(true)
		} else {
			if (fullLyricsNStats.filter(x=> x.album_key == fighter).length == 0){

				setGettingLyrics(true);
				axios.get(`http://localhost:3000/getFullLyricsNStats`, { params:
				{ 'album': fighter }
				})
				// axios.get(`https://swift-api.fly.dev/getFullLyricsNStats`)
				.then(function (response) {								
					fullLyricsNStats = fullLyricsNStats.concat(response.data.fullLyricsNStats)
					// setSongFilter('Anti-Hero')
					console.log(fullLyricsNStats)
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
	
		let top40chart = d3.select('#top40Viz')

		var top40lines = top40chart
			.selectAll('rect').data(top40, function(d) {
			return d.lyric
		})

		top40lines.enter().append('rect')
			.attr('class', function (d) { return `lyricBox ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})		
			.attr('x', 20)
			.attr('y', function(d, i) { 
				return i * 20 + 30})
			.style('width', 300)
			.style('height', '30px')
			.style("overflow", "visible")
			.text(function(d) { return d.lyric })
			// .attr("text-anchor", "middle")
			// .attr("dominant-baseline", "middle")
			
	}, [top40, showTop40])

	useEffect(() => {
		// lyrical data viz 
		
		if (displayLyrics.length > 0) {
			console.log(displayLyrics)

			d3.selectAll('.lyrics').remove()

			let lyric_accuracy = displayLyrics.map(x=> x.accuracy)
			let high = d3.max(lyric_accuracy)
			let low = d3.min(lyric_accuracy)
		
			const scaleFilter = d3.scaleLinear([low, high], [0.25, 1])
			const scaleFontSize = d3.scaleLinear([low, 100], [10, 18])

			let lyrics_viz = d3.select('#lyricalViz').append('g.lyrics')
			let lyrics = lyrics_viz.selectAll('svg').data(displayLyrics, function(d) { return d.line_num})

			lyrics.enter().append('text')
				.attr('class', function (d) { return `lyrics ${albumColorKey[d.album_key as keyof typeof albumColorKey]} ${d.title_in_lyric_match >= 70 || !d.accuracy || d.total < 10 || d.accuracy < 60 ? 'fadeline' : ''}`})
				.attr('x', 20)
				.attr('y', function(d, i) { 
					return i * 20 + 30})			
				.attr("text-anchor", "start")
				// .attr('dy', )
				.style('font-size', function(d) { 
					if (d.title_in_lyric_match >= 70 || !d.accuracy || d.total < 10) {
						// console.log(scaleFontSize(d.accuracy))
						return "10px"
					} else {
						// console.log(Math.round(scaleFontSize(d.accuracy)))
						return `${Math.round(scaleFontSize(d.accuracy))}px`
					} 			
				 })
				.style('opacity', function(d) { 
					if (d.accuracy > 90) {
						return 1
					} else if (d.accuracy > 80) {
						return 0.85
					} else if (d.accuracy > 70) {
						return 0.65
					} else if (d.accuracy > 60) {
						return 0.5
					} else {
						return 0.35
					} 
				})
				.style('font-weight', function (d) {
					// decide what the time/accuracy cutoffs are -- about 350 and 450 bolded respectively w/current 
					if (d.time < 3 && d.accuracy > 90 && d.total > 10){
						return 700
					} else if (d.time < 3.5 && d.accuracy > 90 && d.total > 10) {
						return 500
					}
					
				})
				.style("overflow-x", "visible") // Allow text overflow
				.text(function(d) { return d.lyric })				
				.on('mouseover', function (d) {
					console.log(d.accuracy, d.time, d.total)			
				})
							
	} else {
		// remove data 
		d3.selectAll('.lyricBox').remove()

	}

	}, [displayLyrics, albumFilter])

	async function delayedDataFetch() {
		
		// axios.get(`https://swift-api.fly.dev/getSongs`)
		axios.get(`http://localhost:3000/getSongs`)
			.then(function (response) {					
				// setSongList(response.data.songList.filter(x => x.album_key == albumFilter))
				songsFullDB = response.data.songList
				console.log(songsFullDB)
			})
			.catch(function (error) {				
				console.log(error);
			});	

		setIsLoading(true)
		axios.get(`http://localhost:3000/getLyricStats`)
		// axios.get(`https://swift-api.fly.dev/getLyricStats`)
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

	function changeViz(cover){
		setFighter(cover);	
		setAlbumFilter(cover);							
		setSongList(songsFullDB.filter(s=> s.album_key == cover))		
		setDisplayLyrics('')
		setShowTop40(false)
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

				<div className='flex flex-row flex-wrap justify-center'>
					{!gettingLyrics && !showTop40 && <div>
						{songList.map((x,i)=> 
						<div onClick={() => { setSongFilter(x.song);
							setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == x.song));
						}}
						className={`cursor-pointer rounded-t-xl rounded-b-xl text-center m-2 p-1 pl-3 pr-3 text-m font-bold ${albumColorKey[x.album_key as keyof typeof albumColorKey]} ${songFilter == x.song ? 'selected' : 'faded'}`}
						key={`${x.song}`}
							>{x.song}</div>)}
					</div>}
					{<div>					
						{gettingLyrics && 
						<div>
							<h2>Grabbing the Data!</h2>
							<iframe src="https://giphy.com/embed/4hTWSvzwyse5hRrM57" width="480" height="200" frameBorder="0" className="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/taylorswift-speak-now-taylors-version-4hTWSvzwyse5hRrM57"></a></p>
						</div>}
						
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