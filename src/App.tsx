// import { useState, useRef, FormEvent } from 'react'
import { useState, useRef, useEffect, FormEvent } from 'react'
// import ReactDOM from 'react-dom';

import title from '/title.svg'
import leftarrow from '/left-arrow.svg'

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} from 'obscenity';
import Nav from './Nav.tsx'
import Leaderboard from './Leaderboard.tsx'

// import {
//   QueryClient,
//   QueryClientProvider,
//   useQuery,
// } from '@tanstack/react-query'

let lyricsFullDB: Lyrics[] = [] // all lyrics 
let songsFullDB: SongList[] = [] // all songs 
let leaderboardFullDB: Leaderboard[] = []
// const queryClient = new QueryClient()

function App() {	
	// const location = useLocation()
	
	const gameDate = new Date()

	const ltErasColors = ['eras_green', 'eras_gold', 'eras_purple', 'eras_lblue', 'eras_pink', 'eras_maroon', 'eras_indigo', 'eras_tan', 'eras_grey', 'eras_black'];

	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights'} as const

	const albumKeyLkup = { "Taylor Swift" : "Taylor_Swift", "Fearless" : "Fearless", "Speak Now" : "Speak_Now", 'Red' : 'Red', '1989' : '1989', 'reputation' : 'reputation', 'Lover' : 'Lover', 'folklore' : 'folklore', 'evermore' : 'evermore', 'Midnights' : 'Midnights'} as const

	const gameModes = [{'key' : 'easy', 'value' : 'this is me trying (easy)'}, {'key' : 'classics version', 'value' : "The Classics (rec'd)"}, {'key' : "Taylor's Version", 'value' : "Taylor's Version (hard)"}, {'key' : 'cult version', 'value' : 'my tears richochet (cult)'}] as const

	// {'key' : 'album', 'value' : 'the 1 (album)'}

	const albums = ["Taylor Swift", "Fearless", "Speak Now", "Red", "1989", "reputation", "Lover", "folklore", "evermore", "Midnights"] as const

	const albumCovers = ["Taylor_Swift", "Fearless", "Speak_Now", "Red", "TS1989", "reputation", "Lover", "folklore", "evermore", "Midnights"] as const

	const normal = "classics version" as const
	const hard = "Taylor's Version" as const
	const expert = 'cult version' as const

	// const shareUrl = 'https://swift-af.com/' as const
	// let songList: SongList[] = []

	const intervalRef: {current: NodeJS.Timeout | null } = useRef(null);
	// const intervalRef = useRef<ReturnType<typeof setInterval> | null>()  // ref for stopwatch interval

	const [startTime, setStartTime] = useState<number>(0.0)
	const [currentTime, setCurrentTime] = useState<number>(0.0)
	const [displayLyric, setDisplayLyric] = useState<string>('')
	const [displayLyricId, setDisplayLyricId] = useState<number | undefined>()
	const [song, setSong] = useState<string>('')
	const [album, setAlbum] = useState<string>('')
	const [albumKey, setAlbumKey] = useState<AlbumKey | ''>('')
	const [gameMode, setGameMode] = useState<string>('')
	const [albumMode, setAlbumMode] = useState<Album | '' >('')
	const [showGameModeQ, setShowGameModeQ] = useState<boolean>(false)
	const [songList, setSongList] = useState<SongList[]>([])
	const [lyricsDB, setLyricsDB] = useState<Lyrics[]>([])
	const [gameId, setGameId] = useState<string>(uuidv4())
	const [playerName, setPlayerName] = useState<string>('')
	const [userNameSet, setUserNameSet] = useState<boolean>(false)
	const [filterLeaderboard, setFilterLeaderboard] = useState<filterLeaderboard>('all')
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const [fighter, setFighter] = useState<AlbumArt | ''>('')
	const [fighterChosen, setFighterChosen] = useState<boolean>(false)

	const [postGameDisplay, setPostGameDisplay] = useState<postGameDisplay>('leaderboard')
	const [accuracy, setAccuracy] = useState<string | undefined>()
	const [avgSpeed, setAvgSpeed] = useState<string | undefined>()
 	const [answerChoices, setAnsChoices] = useState<string[]>([])
	const [result, setResult] = useState<string>() // true, false, null? 
	const [gameStats, setGameStats] = useState<GameStats[]>([])  // make this an array of objects with lyric/song/album they got right and the time
	const [leaderboardData, setLeaderboardData] = useState<Leaderboard[]>([])
	const [statsByAlbum, setStatsByAlbum] = useState<StatsByAlbum[]>([])
	const [gameStarted, setGameStarted] = useState<boolean>(false)
	const [displayStats, setDisplayStats] = useState<boolean>(false);

	const wrongAnswersOnly = ["This is why we can't have nice things", "Would you like closure and know the song", "Is this you trying", "It's you, you're the problem", "Not sure how long we're gonna tolerate this for", "I wish you would get the right answer", "That was not the 1", "you'll have an ephiphany on it later", "Made my tears richochet with that one","You forgot that song existed", "Death by a thousand wrongs", "False Swiftie", "You're on your own, kid", "Answer...?", "brain Glitch", "I bet you'll think about that", "You did something bad", "Exhiling you", "tis not the damn song", "Shake it off", "That was sweet nothing"]

	useEffect(() => {
		delayedDataFetch()					
	}, [])

	async function delayedDataFetch() {
		setIsLoading(true)
		console.log('get data')
		// get song list 
		axios.get(`https://swift-api.fly.dev/getSongs`)
		// axios.get(`http://localhost:3000/getSongs`)
			.then(function (response) {	
				setSongList(response.data.songList)
				songsFullDB = response.data.songList
				// console.log(songsFullDB)
			})
			.catch(function (error) {				
				console.log(error);
			});	
		
			axios.get(`https://swift-api.fly.dev/getLyrics`)
		// axios.get(`http://localhost:3000/getLyrics`)
			.then(function (response) {								
				lyricsFullDB = response.data.lyrics	
				setIsLoading(false)
				console.log('got lyrics')	
			})
			.catch(function (error) {				
				console.log(error);
			});	

		axios.get(`https://swift-api.fly.dev/getLeaderboard`)
		// axios.get(`http://localhost:3000/getLeaderboard`)
			.then(function (response) {								
				leaderboardFullDB = response.data.leaderBoard
				console.log(leaderboardFullDB)
				setLeaderboardData(leaderboardFullDB.filter(x=> x.game_mode != 'album'))
			})
			.catch(function (error) {				
				console.log(error);
			});	

	}
	
	function pickRandomAns(correctAnswer: string) {
		// given the answer, pick 4 other random songs 
		// pick 3 random songs that aren't the same as the answer 
		let answerChoices = []
		// array of indexes, we remove when we get a match 
		let songIndices = Array(songList.length).fill(0).map((x,i) => x + i)
		// console.log(songIndices, songList)
		// remove the song that is the answer so we don't get dupes
		songIndices.splice(songList.map(x=> x.song).indexOf(correctAnswer), 1)
		// console.log('spliced', songIndices, songList)

		for (let i = 0; i < 4; i++) {
			let randInd = songIndices[Math.floor(Math.random() * (songIndices.length - 1))]			// sometimes the randint is 162 and we get undefined??? do i need a -1 or no?? 
			answerChoices.push(songList.map(x=> x.song)[randInd])
			// remove the index so we don't have repeats
			songIndices.splice(songIndices.indexOf(randInd), 1)
			// console.log('songIndices', songIndices, randInd, songIndices.indexOf(randInd))			 
		}

		// need the +1 of you'll never have it be the last option choice with math.floor
		let insertInd = Math.floor(Math.random()*(answerChoices.length + 1))
		// console.log('insertInd', insertInd)
		answerChoices.splice(insertInd, 0, correctAnswer)
		// console.log(answerChoices, song)

		return answerChoices

	}

	useEffect(() => {
		// need use effect so that the song/lyric db for the diff game types update fast enough
		filterLyricsDB(gameMode)
		// console.log(songList, lyricsDB, gameMode, albumMode)

	}, [albumMode, gameMode, gameStarted, isLoading])

	useEffect(()=> {
		// if we tried to start the game and it's not ready yet
		if (gameStarted){
			startGame()
		}		
	}, [isLoading])

	useEffect(()=> {
		if (filterLeaderboard == 'all') {
			setLeaderboardData(leaderboardFullDB.filter(x=> x.game_mode != 'album'))
		} else {
			setLeaderboardData(leaderboardFullDB.filter(x=> x.game_mode == 'album'))
		}
		
	}, [filterLeaderboard])

	function filterLyricsDB(level: string){
		// filter/set the lyrics 		
		console.log('lyricsFullDB', level, lyricsFullDB)
		let songBank: SongList[]
		let lyricsBank: Lyrics[]

		if (level == 'easy'){
			lyricsBank = lyricsFullDB.filter(x=> x.filler == 0 && x.vault == 0)
			songBank = songsFullDB.filter(x=> x.vault == 0)
		} else if (level == normal) {
			lyricsBank = lyricsFullDB.filter(x=> x.filler == 0 && x.vault == 0 && x.title_in_lyric_match < 70)
			songBank = songsFullDB.filter(x=> x.vault == 0)
		} else if (level == hard) {
			// hard is all + more recent vault songs but no filler
			lyricsBank = lyricsFullDB.filter(x=> x.filler == 0 && x.title_in_lyric_match < 70)
			songBank = songsFullDB
		} else if (level == expert) {
			// expert level has vault songs and only filler words lmao
			lyricsBank = lyricsFullDB.filter(x=> x.filler == 1)
			songBank = songsFullDB
		} else {
			// filter by album 
			lyricsBank = lyricsFullDB.filter(x=> x.album == albumMode && x.filler == 0 && x.title_in_lyric_match < 70)
			songBank = songsFullDB.filter(x=> x.album == albumMode)
		}

		console.log('filterLyricsDB', songList, lyricsDB, gameMode, albumMode)

		setSongList(songBank)
		setLyricsDB(lyricsBank)
		// return { songBank: songBank, lyricsBank: lyricsBank}
		
	}

	// start timer for beg of game 
	function startGame() {
		console.log(
			'startGame', isLoading, gameStarted
		)
		setGameStarted(true)

		// if fighter is null, 
		if (fighter == '') {
			setFighter('imtheproblem')
		}

		if (!isLoading){
			if (gameMode == 'album' && albumMode == '') {
				setGameStarted(false)
				alert("Don't forget to pick an album")
			} else {
				console.log('start', lyricsFullDB)
				console.log('startGame', gameMode, albumMode, lyricsDB, songList)
				setDisplayStats(false) // in case you're starting another game
								
				setStartTime(Date.now())
				setCurrentTime(Date.now())
				setGameStats([])
			
				setGameId(uuidv4())		
	
				const randInd = Math.floor(Math.random() * lyricsDB.length)
				
				clearInterval(intervalRef.current as NodeJS.Timeout)
				// start timer and display a lyric 
				setAnsChoices(pickRandomAns(lyricsDB[randInd].song))
				setDisplayLyric(lyricsDB[randInd].lyric)
				setDisplayLyricId(lyricsDB[randInd].id)
				setSong(lyricsDB[randInd].song.trim())
				setAlbum(lyricsDB[randInd].album.trim())
				setAlbumKey(lyricsDB[randInd].album_key)
				intervalRef.current = setInterval(() => setCurrentTime(Date.now()), 10)		
				// console.log(randInd, lyricsDB[randInd])
			}
		}		
		
	}

	function checkAnswer(clicked: string) {
		// console.log(gameId)
		// console.log('wtf2', lyricsDB, songList)
		// console.log(clicked == song, song, clicked)
		if (albumKey === '') {
			return
		}

		if(displayLyricId === undefined) {
			return
		}

		let correct: number;
		if (song.trim() == clicked.trim()){ 
			setResult('Correct!')
			correct = 1
			setGameStats([{'time': secondsElapsed, song: song, userResponse: clicked.trim(), correct: 1, album: album, lyric: displayLyric, album_key: albumKey, level: gameMode, lyric_id: displayLyricId, id: gameStats.length + 1}, ...gameStats])

		} else {
			correct = 0
			setResult(wrongAnswersOnly[Math.floor(Math.random() * wrongAnswersOnly.length)])
			setGameStats([{'time': secondsElapsed, song: song, userResponse: clicked.trim(), correct: 0, album: album, lyric: displayLyric, album_key: albumKey, level: gameMode, lyric_id: displayLyricId, id: gameStats.length + 1}, ...gameStats])
		}

		
		// save results before resetting
		// axios.post('http://localhost:3000/saveGameData', {
		axios.post('https://swift-api.fly.dev/saveGameData', {
			level: gameMode,
			time: secondsElapsed, 
			lyric: displayLyric,
			correct: correct, 
			date: `${gameDate.toISOString().slice(0, 10)}`,
			gameId: gameId,
			song: song,
			lyric_id: displayLyricId,
			playerName: playerName,
			albumMode: albumMode,
			fighter: fighter
		})
		.then(function () {
			// console.log(response)
		})
		.catch(function (error) {			
			console.log(error);
		});
		// log results 	
		console.log({'time': secondsElapsed, song: song, userResponse: clicked.trim(), correct: 0, album: album, lyric: displayLyric},gameStats)

		let rand = Math.floor(Math.random() * lyricsDB.length)
		// change song, clear input, reset timer
		
		setDisplayLyric(lyricsDB[rand].lyric)
		setDisplayLyricId(lyricsDB[rand].id)
		setSong(lyricsDB[rand].song.trim())
		setAlbum(lyricsDB[rand].album.trim())
		setAlbumKey(lyricsDB[rand].album_key)
		setAnsChoices(pickRandomAns(lyricsDB[rand].song))
		// setUserResponse('')
		
		setStartTime(Date.now())
		setCurrentTime(Date.now())
	
	}

	function submitUserName(e: FormEvent<HTMLFormElement>){
		e.preventDefault()
		
		if (playerName == ''){
			setPlayerName('toolazytotype')
		} else {
			// censor for user names
			const censor = new TextCensor()
			const matcher = new RegExpMatcher({
				...englishDataset.build(),
				...englishRecommendedTransformers,
			});
			const matches = matcher.getAllMatches(playerName)
			
			const userName = censor.applyTo(playerName, matches)
			setPlayerName(userName)
		}
		
		setUserNameSet(true)
		setGameMode("classics version")  // trigger filtering data
		console.log('submit name')

	}

	function restartGame(){
		// goes to home page where you can change levels/user names
		setGameId(uuidv4())		
		setDisplayStats(false)
		setGameStarted(false)

		console.log('restartGame', lyricsDB)
	}

	function endGame(){

		// sort gamestats so it's clumped by album
		if (gameMode == 'album') {
			setGameStats(gameStats.sort((a,b) => (a.song > b.song) ? 1 : (b.song > a.song) ? -1 : 0))

		} else {
			setGameStats(gameStats.sort((a,b) => (a.album > b.album) ? 1 : (b.album > a.album) ? -1 : 0))
		}
		
		// end game and show game stats
		setGameStarted(false)
		if (gameStats.length > 0) {
			getPostGameReport()
			setDisplayStats(true)
		} 
		
	}

	function getPostGameReport(){

		if (gameStats.length > 0) {
			
			// calc stats by album and other various stats
			let overall = (100*gameStats.filter(x=> x.correct == 1).length/gameStats.length).toFixed(0)
			// console.log((100*gameStats.filter(x=> x.correct == 1).length/gameStats.length).toFixed(0))

			// if they guessed 50% correct/at least 8 correct, then pull scoreboard stats again 
			if (gameStats.filter(x=> x.correct == 1).length > 7 && parseInt(overall) >= 50) {
				setIsLoading(true)
				axios.get(`https://swift-api.fly.dev/getLeaderboard`)
				// axios.get(`http://localhost:3000/getLeaderboard`)
					.then(function (response) {								
						leaderboardFullDB = response.data.leaderBoard
						console.log(leaderboardFullDB)
						setLeaderboardData(leaderboardFullDB.filter(x=> x.game_mode != 'album'))
						setIsLoading(false)
					})
					.catch(function (error) {				
						console.log(error);
					});	

			}

			setAccuracy(overall)

			setAvgSpeed((gameStats.map(x=> x.time).reduce((total, current) => total + current, 0)/gameStats.length).toFixed(2))
		
			let allStatsByAlbums: StatsByAlbum[] = []

			// either create a function where it returns the type or create the type/obj at the beg
			for (let i = 0; i < albums.length; i++) {
				let albumStats = gameStats.filter(x=> x.album == albums[i])
				let calcStats: StatsByAlbum = { album: albums[i], correct: 0, total: 0, avgTime: '', albumKey: albumKeyLkup[albums[i]]}
			
				// calcStats.album = albums[i]				

				if (albumStats.length > 0) {
					calcStats.correct = albumStats.filter(x=> x.correct).length
					calcStats.total = albumStats.length
					calcStats.avgTime = (albumStats.map(x=> x.time).reduce((acc,curr) => acc + curr, 0)/albumStats.length).toFixed(1)
					calcStats.albumKey = albumStats[0].album_key

					allStatsByAlbums.push(calcStats)

				}
				
			}

			console.log(allStatsByAlbums)

			setStatsByAlbum(allStatsByAlbums)
		}
		
	}

	let secondsElapsed = 0;
  if (startTime != null && currentTime != null) {
    secondsElapsed = (currentTime - startTime) / 1000;
  }
	
  return (
    <>
			{!gameStarted && <Nav location={location}></Nav>}
			<div className={`grid grid-cols-1 p-4 items-center ${gameStarted ? '' : 'mt-20'} lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2`}>
				<div className=''>
					<img src={title} className={`mx-auto logo p-4 ${(gameStarted || displayStats) ? 'max-h-32' : ''}`} alt="Swift AF" />				
				</div>
				{(gameStats.length > 0) && displayStats && <div className='flex min-w-full items-center'>
					<div onClick = {() => setPostGameDisplay('leaderboard')} 
					className={`era-evermore display inline-flex justify-center text-xl font-bold shadow cursor-pointer appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center ${postGameDisplay == 'leaderboard' ? 'underline' : 'faded'}`}>swift af boi</div>
					<div onClick = {() => setPostGameDisplay('stats')} className={`era-evermore display inline-flex justify-center text-xl font-bold shadow cursor-pointer appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center ${postGameDisplay == 'stats' ? 'underline' : 'faded'}`}>long story short</div>					
				</div>}

				{gameStarted && isLoading && <h2>Ah we're not ready for it, the server give me nothin' back yet. Stay, stay, stay. Don't go.</h2>}
				
				{/* <Scoreboard data={leaderboardData}/>	 */}
				{!gameStarted && !displayStats && <div className='grid grid-cols-1'>
					{!userNameSet && <div>
						<h2>So you think you're the 1? The Swiftest fan?</h2>
					<h2>How quickly can you name the song given a line?</h2>
					</div>}
					{!userNameSet && <div className='p-2 pt-0 grid grid-cols-1 text-center transition-all ease-in-out duration-300'>
						<form className="era-1989 cursor-pointer shadow-md rounded px-8 pt-6 pb-6 mb-4" onSubmit={(e: FormEvent<HTMLFormElement>) => submitUserName(e)}>
							<label className='block'> the leaderboard has a blank space
								<input className="shadow cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" type='text' 
								value={playerName} 
								placeholder='Your display name'
								maxLength={20}
								onChange={e => setPlayerName(e.target.value)}>
								</input>
							</label>
							<button className='era-midnights mt-4 cursor-pointer'>Hi, it's me.</button>
						</form>
					</div>}
					{userNameSet && <div>

						<div className='pr-4 pl-4 pt-0 grid grid-cols-1'>						
						<button className="era-folklore cursor-pointer p-2 m-2 shadow-md rounded-t-xl rounded-b-xl" onClick={() => setUserNameSet(false)}><img src={leftarrow} className='cursor-pointer inline logo h-8 mr-2 pr-2 ' alt="change name" />
								cursing my display name, wishing I wasn't {playerName}
							</button>
						</div>

						<div>
							<h2>Choose your fighter</h2>							
							<div className='flex flex-row flex-wrap justify-center'>
							{albumCovers.map(x=> <img src={`/icons/${x}.jpg`}  className ={`albums ${(fighterChosen && fighter != x) ? 'faded' : fighterChosen && fighter == x ? 'selected' : ''}`} onClick={()=> {
								setFighter(x);
								setFighterChosen(true);
								}}></img>)}	
							
							</div>

						</div>
							{/* the old {playerName} is dead */}
							<h2>Pick an Eras mode</h2>

						<div className="cursor-pointer rounded-t-xl rounded-b-xl text-center mt-4" onClick={() => setShowGameModeQ(!showGameModeQ)}>
							<div className='text-md font-bold'>Question...?</div>
							{showGameModeQ && <div>								
								<div>Easy: song title might be in the lyric; no vault songs</div>
								<div>Classics: lyrics with song title should be removed; no vault songs</div>
								<div>Hard: vault songs included</div>
								<div>Cult: vault + a surprise ooohhh good luck</div>
								<div>the 1: focus on one album, deluxe + vault</div>
								</div>}
						</div>
						<div className='p-4 pt-0 grid grid-cols-1'>
							<div className="text-center m-4 p-2 text-md">
							{gameModes.map((x,i)=> 
							<button 
								className={`block min-w-full cursor-pointer rounded-t-xl rounded-b-xl p-2 text-center text-md font-bold ${ltErasColors[i]} ${gameMode == x.key ? '' : 'faded'}`} id={x.key} 
								onClick={() => {
									setAlbumMode(''); 
									setGameMode(x.key);
								}}>{x.value}
							</button>)}

							<h2>or pick an album</h2>
							{<button 
								className={`block min-w-full cursor-pointer rounded-t-xl rounded-b-xl p-2 text-center text-md font-bold ${ltErasColors[0]} ${gameMode == 'album' ? '' : 'faded'}`} id={'album'} 
								onClick={() => {
									setAlbumMode(''); 
									setGameMode('album');
								}}>the 1 (album)
							</button>}
							
							{gameMode == 'album' && <div className='p-4 grid grid-cols-1'>
								{albums.map((x,i)=> <button className={`block min-w-full cursor-pointer rounded-t-xl rounded-b-xl text-center p-2 text-[#68416d] ${albumMode == x ? '' : 'faded'} ${albumColorKey[albumKeyLkup[x] as keyof typeof albumColorKey]}`}
								onClick={() => {
									setGameMode('album')
									setAlbumMode(x)}}
								>{albums[i]}</button>)}
								</div>}

							</div>
							{/* <div>{gameMode == 'easy' ? "don't waste all your potential" : gameMode == 'normal' ? "The classics! it's time to go" : gameMode == 'hard' ? '' : gameMode == 'expert' ? 'hahahah good luck' : gameMode == 'album' ? `so you think you're a ${albumMode} Superstar?` : ''}</div> */}
							{playerName && <button className='m-4 era-reputation p-4 text-lg font-bold rounded-t-xl rounded-b-xl' onClick={() => startGame()}>...Ready For It</button>}
							
						</div>
					</div>}
				</div>}

				{/* GAME BOARD */}
				{gameStarted && !displayStats && !isLoading && <div className=''>					
					<div className='font-bold text-xl text-center p-2'>
						{displayLyric}</div>

					{answerChoices.map((x,i) => <div className={`cursor-pointer rounded-t-xl rounded-b-xl text-center m-4 p-2 text-lg font-bold ${ltErasColors[i]}`}
						onClick={() => checkAnswer(x)}> {x}</div>)}
					<h3>{secondsElapsed.toFixed(3)}</h3>
				
					<div className='text-lg font-bold m-4 p-2'>{result}
					{gameStats.length > 0 ? <div>
						{gameStats.map(x=> x.correct).reduce((total, current) => total + current, 0)}/{gameStats.length} Correct {(100*gameStats.map(x=> x.correct).reduce((total, current) => total + current, 0)/gameStats.length).toFixed(0)}%</div> : ''}
					</div>

					<div className='flex justify-center flex-row'>
						<button className='era-red btn text-xl font-bold' onClick={() => restartGame()}>Begin Again</button>
						<button className='era-reputation btn text-xl font-bold' onClick={() => endGame()}>End Game</button>
					</div>
									
				</div>}


				{/* GAME STATS */}
				{(gameStats.length > 0) && displayStats && <div className='p-0 pt-0 flex flex-col items-center justify-center'>
					{/* <h3 className='font-bold text-xl text-center'>long story short for your {gameStats.length} tries</h3> */}
					{postGameDisplay == 'stats' && <div className='p-0 pt-0 flex flex-col items-center justify-center'>
						<div className='font-bold text-xl text-center p-2 m-2'>{accuracy === undefined ? '' : parseFloat(accuracy || "0") < 40 ? "Shake it off, soon you'll get better" : parseFloat(accuracy) > 70 ? "I knew I saw a light in you, Superstar" : ''}</div>
						<div className='flex justify-center font-bold flex-row flex-wrap'>
						<h1 className={`${albumMode != '' ? albumColorKey[albumKeyLkup[albumMode]] : 'era-midnights'} shadow-md pr-4 pl-4 pt-2 pb-2 m-2`}>{accuracy}%</h1>
						<h1 className={`${albumMode != '' ? albumColorKey[albumKeyLkup[albumMode]] : 'era-midnights'} shadow-md pr-4 pl-4 pt-2 pb-2 m-2`}>{avgSpeed} sec/line</h1>
						</div>

						{/* <div>{gameStats.map(x=> x.correct).reduce((total, current) => total + current, 0)}/{gameStats.length} Correct 
						</div>					
						<div>{(gameStats.map(x=> x.time).reduce((total, current) => total + current, 0)/gameStats.length).toFixed(2)} seconds per lyric</div>					 */}
												
						{gameStats.filter(x=> x.correct == 1).length > 0 && 
							<div>
								<h3 className='font-bold text-xl text-center'>happiness</h3> 
									<table className='mb-4'>
										<thead>
											<tr>
											<th>Lyric</th>
											<th>Song</th>
											<th>Time</th>
											</tr>
										</thead>
										<tbody>
											{gameStats.filter(x=> x.correct == 1).map(x =><tr className={`text-center text-[#68416d] ${albumColorKey[x.album_key as keyof typeof albumColorKey]}`}>
												<td className="border p-1">{x.lyric}</td>
												<td className="border p-1">{x.song}</td>
												<td className="border p-1">{x.time.toFixed(1)}s</td>
											</tr>)}		
										</tbody>
									</table>
							</div>
						}
								
						{gameStats.filter(x=> x.correct == 0).length > 0 &&
						<div className=''>
							<h3 className='font-bold text-xl text-center'>Would've, Could've, Should've</h3>
							<table className='mb-4'>
								<thead>
									<tr>
									<th>Lyric</th>
									<th>Song</th>
									<th>Your Ans</th>
									</tr>
								</thead>
								<tbody>
								{/* ${albumColorKey[x.album_key: keyof albumColorKey]} */}
									{gameStats.filter(x=> x.correct == 0).map((x) =><tr  className={`text-center text-[#513355] ${albumColorKey[x.album_key]}`}>
										<td className="border p-1">{x.lyric}</td>
										<td className="border p-1">{x.song}</td>
										<td className="border p-1">{x.userResponse}</td>
									</tr>)}		
								</tbody>
							</table>
						</div>}
						
						{/* stats by album if you do enough */}
						{statsByAlbum.length > 0 && gameStats.length > 10 && gameMode != 'album' && <div className='mb-4'>
							<table>
								<thead>
									<tr>
									<th>Album</th>
									<th>Total</th>
									<th>Time</th>
									</tr>
								</thead>
								<tbody>
									{statsByAlbum.map(x =><tr className={`text-center text-[#68416d] ${albumColorKey[x.albumKey as keyof typeof albumColorKey]}`}>
										<td className="border p-1">{x.album}</td>
										<td className="border p-1">{x.correct}/{x.total}</td>
										<td className="border p-1">{x.avgTime}</td>
									</tr>)}		
								</tbody>					

							</table>
						</div>}
					</div>}
					{postGameDisplay == 'leaderboard' && !isLoading && <div>
						<div className='flex flex-row m-2 p-2 bold text-center justify-center'>
							<div className={`${filterLeaderboard == 'all' ? 'era-reputation' : 'faded'} inline p-2 min-w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
								onClick={() => setFilterLeaderboard('all')}>The Eras</div>
							<div className={`${filterLeaderboard == 'album' ? 'era-reputation' : 'faded'} inline p-2 min-w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
								onClick={() => setFilterLeaderboard('album')}>By Album</div>
						</div>
						<Leaderboard data={leaderboardData}/>
						<h6 className='text-sm'>Minimum 8 correct and 50% accuracy.  No easy mode.  Filter subject to change.</h6>
					</div>}

					{postGameDisplay == 'leaderboard' && isLoading && <div>
						<h3>Checking to see if you made the leaderboard!</h3>						
						</div>}
							
				
				<button className='m-6 era-red p-3 min-w-[250px] text-xl font-bold' onClick={() => restartGame()}>Begin Again</button>	
				</div>}

			
				{/* <p>Curiosity, but if you wanna give me a friendship bracelet in the form of $1s for my TSwift Tix fund...I did have to clean the data and remove all the Oh oh oh lines. </p> */}
			</div>
		</>
  )
}

export default App

// ReactDOM.render(
// 	<App />, 
// 	document.querySelector('#root')
// )

