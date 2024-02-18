import { useState, useEffect } from 'react'
import title from '/title.svg'
import axios from 'axios';
import Nav from './Nav.tsx'
import moment from 'moment';

let lyricStats: LyricData[] = []
let fullLyricsNStats: LyricData[] = []
let songsFullDB: SongList[] = [] // all songs 

function Dataland() {	

	const accuracy_filter = 95;  // for the initial view, have min 95 accuracy;
	const ltErasColors = ['eras_green', 'eras_gold', 'eras_purple', 'eras_lblue', 'eras_pink', 'eras_maroon', 'eras_indigo', 'eras_tan', 'eras_grey', 'eras_black'];

	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights'} as const

	const albumKeyLkup = { "Taylor Swift" : "Taylor_Swift", "Fearless" : "Fearless", "Speak Now" : "Speak_Now", 'Red' : 'Red', '1989' : '1989', 'reputation' : 'reputation', 'Lover' : 'Lover', 'folklore' : 'folklore', 'evermore' : 'evermore', 'Midnights' : 'Midnights'} as const

	const albumCovers = ["Taylor_Swift", "Fearless", "Speak_Now", "Red", "1989", "reputation", "Lover", "folklore", "evermore", "Midnights"] as const


	const [fighter, setFighter] = useState<AlbumArt | ''>('')
	const [fighterChosen, setFighterChosen] = useState<boolean>(false)

	const [albumFilter, setAlbumFilter] = useState<AlbumKey | ''>('')
	const [songFilter, setSongFilter] = useState<string>('')
	const [displayLyrics, setDisplayLyrics] = useState<LyricData[] | ''>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const [songList, setSongList] = useState<SongList[]>([])
	const [gettingLyrics, setGettingLyrics] = useState<boolean>(false)

	useEffect(() => {

		delayedDataFetch()
	
	}, [])


	// useEffect(()=> {

	// 	if (fighter != '' && fullLyricsNStats.filter(x=> x.album_key == fighter).length == 0){

	// 		setGettingLyrics(true);
	// 		axios.get(`http://localhost:3000/getFullLyricsNStats`, { params:
	// 		{ 'album': fighter }
	// 		})
	// 		// axios.get(`https://swift-api.fly.dev/getFullLyricsNStats`)
	// 		.then(function (response) {								
	// 			fullLyricsNStats = fullLyricsNStats.concat(response.data.fullLyricsNStats)
	// 			// setSongFilter('Anti-Hero')
	// 			console.log(fullLyricsNStats)
	// 			if (songsFullDB.length > 0) {
	// 				let first_track = songsFullDB.filter(s=> s.album_key == albumFilter)[0].song
	// 				setSongFilter(first_track)
	// 				setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == first_track))
	// 			}

	// 			setGettingLyrics(false);
	// 		})
	// 		.catch(function (error) {	
	// 			console.log(error);
	// 		});	
	// 	}
	// 	else {
	// 		console.log('already have lyrics for ', fighter)
	// 		if (songsFullDB.length > 0) {
	// 			setSongFilter(songsFullDB.filter(s=> s.album_key == albumFilter)[0].song)
	// 		}
	// 	}

	// }, [fighter])


	async function delayedDataFetch() {

		// setGettingLyrics(true);
		setIsLoading(true)

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

		axios.get(`http://localhost:3000/getLyricStats`)
		// axios.get(`https://swift-api.fly.dev/getLyricStats`)
		.then(function (response) {								
			lyricStats = response.data.lyricStats
			console.log(lyricStats)
		})
		.catch(function (error) {				
			console.log(error);
		});	

		axios.get(`http://localhost:3000/getFullLyricsNStats`)
			// axios.get(`https://swift-api.fly.dev/getFullLyricsNStats`)
			.then(function (response) {								
				fullLyricsNStats = response.data.fullLyricsNStats
				// setSongFilter('Anti-Hero')
				console.log(fullLyricsNStats)
				if (songsFullDB.length > 0) {
					let first_track = songsFullDB.filter(s=> s.album_key == albumFilter)[0].song
					setSongFilter(first_track)
					setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == first_track))
				}

				// setGettingLyrics(false);

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

	return (
		<>
			<Nav location={location}></Nav>
			{isLoading && <div className='grid grid-cols-1 p-2 justify-items-center mt-20 lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2 justify-center'>
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />	
				</div>
				{/* <h2>Wait, don't go. The story of us is coming! </h2>				 */}
				<div>
					<h2>Grabbing the Data!</h2>
					<iframe src="https://giphy.com/embed/4hTWSvzwyse5hRrM57" width="480" height="200" frameBorder="0" className="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/taylorswift-speak-now-taylors-version-4hTWSvzwyse5hRrM57"></a></p>
				</div>
						</div>}
				{!isLoading && <div className='grid grid-cols-1 p-2 justify-items-center mt-20 lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2 justify-center'>
				
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />				
				</div>	
				
				{!isLoading && <div>
					<h2>Choose your fighter</h2>							
					<div className='flex flex-row flex-wrap justify-center'>
					{albumCovers.map(x=> <img src={`/icons/${x}.jpg`} key={x} className ={`albums ${(fighterChosen && fighter != x) ? 'faded' : fighterChosen && fighter == x ? 'selected' : ''}`} onClick={()=> {
						setFighter(x);	
						setAlbumFilter(x);							
						setSongList(songsFullDB.filter(s=> s.album_key == x))
						setFighterChosen(true);

						let first_track = songsFullDB.filter(s=> s.album_key == x)[0].song
						setSongFilter(first_track)
						setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == first_track))

						}}></img>)}					
					</div>	
				</div>
}
				<div className='flex flex-row flex-wrap justify-center'>
					{!isLoading && <div>
						{songList.map((x,i)=> 
						<div onClick={() => { setSongFilter(x.song);
							setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == x.song))
						}}
						className={`cursor-pointer rounded-t-xl rounded-b-xl text-center m-2 p-1 pl-3 pr-3 text-m font-bold ${albumColorKey[x.album_key as keyof typeof albumColorKey]} ${songFilter == x.song ? 'selected' : 'faded'}`}
						key={`${x.song}`}
							>{x.song}</div>)}
					</div>}
					{<div>					
						{!isLoading && displayLyrics && fullLyricsNStats && <div className='flex flex-col container bold text-center justify-center items-center'>
							{displayLyrics.map(line => 
							<div key={`${line.album_key}_${line.orig_lyric_id}`}
								className={''}
							>{line.lyric}</div>)}

						</div>}
						{/* {isLoading && 
						<div>
							<h2>Grabbing the Data!</h2>
							<iframe src="https://giphy.com/embed/4hTWSvzwyse5hRrM57" width="480" height="200" frameBorder="0" className="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/taylorswift-speak-now-taylors-version-4hTWSvzwyse5hRrM57"></a></p>
						</div>} */}
						
					</div>}
				</div>
					
				
				
			</div>}
		</>
	)

}

export default Dataland