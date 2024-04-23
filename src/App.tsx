// import { useState, useRef, FormEvent } from 'react'
import { useState, useRef, useEffect, FormEvent } from 'react'
// import ReactDOM from 'react-dom';

import title from '/title.svg'
import leftarrow from '/icons/left-arrow.svg'

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

import { useCookies } from 'react-cookie';


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
	
	const min_accuracy = 97.5;
	const min_correct = 50;

	const ltErasColors = ['eras_green', 'eras_gold', 'eras_purple', 'eras_lblue', 'eras_pink', 'eras_maroon', 'eras_indigo', 'eras_tan', 'eras_grey', 'eras_black'];

	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights', 'TTPD': 'era-ttpd'} as const

	const albumKeyLkup = { "Taylor Swift" : "Taylor_Swift", "Fearless" : "Fearless", "Speak Now" : "Speak_Now", 'Red' : 'Red', '1989' : '1989', 'reputation' : 'reputation', 'Lover' : 'Lover', 'folklore' : 'folklore', 'evermore' : 'evermore', 'Midnights' : 'Midnights', 'THE TORTURED POETS DEPARTMENT': 'TTPD'} as const

	const gameModes = [{'key' : 'easy', 'value' : 'this is me trying (easy)'}, {'key' : 'classics version', 'value' : "The Classics (rec'd)"}, {'key' : "Taylor's Version", 'value' : "Taylor's Version (hard)"}, {'key' : 'cult version', 'value' : 'my tears richochet (cult)'}] as const

	// {'key' : 'album', 'value' : 'the 1 (album)'}

	const albums = ["Taylor Swift", "Fearless", "Speak Now", "Red", "1989", "reputation", "Lover", "folklore", "evermore", "Midnights", "THE TORTURED POETS DEPARTMENT"] as const

	const albumCovers = ["Taylor_Swift", "Fearless", "Speak_Now", "Red", "1989", "reputation", "Lover", "folklore", "evermore", "Midnights", 'ttpd'] as const

	const normal = "classics version" as const
	const hard = "Taylor's Version" as const
	const expert = 'cult version' as const

	// const shareUrl = 'https://swift-af.com/' as const
	// let songList: SongList[] = []

	const intervalRef: {current: NodeJS.Timeout | null } = useRef(null);
	// const intervalRef = useRef<ReturnType<typeof setInterval> | null>()  // ref for stopwatch interval

	const [startTime, setStartTime] = useState<number>(0.0)
	const [currentTime, setCurrentTime] = useState<number>(0.0)
	const [gameDate, setGameDate] = useState<string>((new Date).toISOString())
	const [displayLyric, setDisplayLyric] = useState<string>('')
	const [displayLyricId, setDisplayLyricId] = useState<number | undefined>()
	const [song, setSong] = useState<string>('')
	const [album, setAlbum] = useState<string>('')
	const [albumKey, setAlbumKey] = useState<AlbumKey | ''>('')
	const [gameMode, setGameMode] = useState<game_mode | ''>('')
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

	const [postGameDisplay, setPostGameDisplay] = useState<postGameDisplay>('stats')
	const [accuracy, setAccuracy] = useState<string | undefined>()
	// const [avgSpeed, setAvgSpeed] = useState<string | undefined>()
 	const [answerChoices, setAnsChoices] = useState<string[]>([])
	const [result, setResult] = useState<string>() // true, false, null? 
	const [gameStats, setGameStats] = useState<GameStats[]>([])  // make this an array of objects with lyric/song/album they got right and the time
	const [leaderboardData, setLeaderboardData] = useState<Leaderboard[]>([])
	const [statsByAlbum, setStatsByAlbum] = useState<StatsByAlbum[]>([])
	const [gameStarted, setGameStarted] = useState<boolean>(false)
	const [displayStats, setDisplayStats] = useState<boolean>(false);
	const [gameRank, setGameRank] = useState<Leaderboard[]>([])
	const [cookies] = useCookies(['sess']);
	const [userCookie] = useCookies(['user_id']);

	// const [loggedInUser, setLoggedInUser] = useState<number | null>(null)  // user id if logged in 

	const wrongAnswersOnly = ["This is why we can't have nice things", "Would you like closure and know the song", "Is this you trying", "It's you, you're the problem", "Can we tolerate this", "I wish you would get the right answer", "That was not the 1", "you'll have an ephiphany on it later", "Made my tears richochet with that one","You forgot that song existed", "You're losing it", "Death by a thousand wrongs", "False Swiftie", "You're on your own, kid", "Answer...?", "brain Glitch", "I bet you'll think about that", "You did something bad", "Exhiling you", "tis not the damn song", "Shake it off", "That was sweet nothing", "Your answers are ruining my life", "Do you hate it here?", "So long, Leaderboard", "You Can Fix This (No Really, You Can)", "Move to Florida", "Are we at the gym? Why Am I crying?"]

	useEffect(() => {
	

		delayedDataFetch()					

		
	}, [])
	

	async function delayedDataFetch() {
		setIsLoading(true)
		
		// Promise.all([axios.get(`http://localhost:3000/getSongs`), axios.get(`http://localhost:3000/getLyrics`), axios.get(`http://localhost:3000/getLeaderboard`)])
		Promise.all([axios.get(`https://swift-api.fly.dev/getSongs`), axios.get(`https://swift-api.fly.dev/getLyrics`), axios.get(`https://swift-api.fly.dev/getLeaderboard`)])
		.then(([r1, r2, r3]) => {

			console.log('got data')
			songsFullDB = r1.data.songList
			setSongList(r1.data.songList)
			lyricsFullDB = r2.data.lyrics	
			
			leaderboardFullDB = r3.data.leaderBoard
				// console.log('init', 'got leaderboard')
			setLeaderboardData(leaderboardFullDB.filter(x=> x.game_mode != 'album'))
			
			setIsLoading(false)
		}).catch(function (error) {				
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
		// console.log('lyricsFullDB', level, lyricsFullDB)
		let songBank: SongList[]
		let lyricsBank: Lyrics[]

		if (level == 'easy'){
			lyricsBank = lyricsFullDB.filter(x=> x.filler == 0 && x.vault == 0 && x.album_key != 'TTPD')
			songBank = songsFullDB.filter(x=> x.vault == 0 && x.album_key != 'TTPD')
		} else if (level == normal) {
			lyricsBank = lyricsFullDB.filter(x=> x.filler == 0 && x.vault == 0 && x.title_in_lyric_match < 70 && x.album_key != 'TTPD')

			songBank = songsFullDB.filter(x=> x.vault == 0 && x.album_key != 'TTPD')
		} else if (level == hard) {
			// hard is all + more recent vault songs but no filler
			lyricsBank = lyricsFullDB.filter(x=> x.filler == 0 && x.title_in_lyric_match < 70 && x.album_key != 'TTPD')
			songBank = songsFullDB.filter(x=> x.album_key != 'TTPD')
		} else if (level == expert) {
			// expert level has vault songs and only filler words lmao
			lyricsBank = lyricsFullDB.filter(x=> x.filler == 1)
			songBank = songsFullDB
		} else {
			// filter by album 
			lyricsBank = lyricsFullDB.filter(x=> x.album == albumMode && x.filler == 0 && x.title_in_lyric_match < 70)
			songBank = songsFullDB.filter(x=> x.album == albumMode)
		}

		// console.log('filterLyricsDB', songList, lyricsDB, gameMode, albumMode)

		setSongList(songBank)
		setLyricsDB(lyricsBank)
		// return { songBank: songBank, lyricsBank: lyricsBank}
		
	}

	// start timer for beg of game 
	function startGame() {
		// console.log(
		// 	'startGame', isLoading, gameStarted
		// )
		const today = new Date()
	
		setGameDate(today.toISOString())
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
				// console.log('start', lyricsFullDB)
				// console.log('startGame', gameMode, albumMode, lyricsDB, songList)
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

			setGameStats([{'time': secondsElapsed, song: song, userResponse: clicked.trim(), correct: 1, album: album, lyric: displayLyric, album_key: albumKey, level: gameMode, lyric_id: displayLyricId, id: gameStats.length + 1, user_id: userCookie.user_id ? userCookie.user_id : null}, ...gameStats])

		} else {
			correct = 0

			setResult(wrongAnswersOnly[Math.floor(Math.random() * wrongAnswersOnly.length)])
			setGameStats([{'time': secondsElapsed, song: song, userResponse: clicked.trim(), correct: 0, album: album, lyric: displayLyric, album_key: albumKey, level: gameMode, lyric_id: displayLyricId, id: gameStats.length + 1, user_id: userCookie.user_id ? userCookie.user_id : null}, ...gameStats])
		}
		
		// save results before resetting
		// axios.post('http://localhost:3000/saveGameData', {
			// console.log(gameDate)
		axios.post('https://swift-api.fly.dev/saveGameData', {
			level: gameMode,
			time: secondsElapsed, 
			lyric: displayLyric,
			correct: correct, 
			date: gameDate,
			gameId: gameId,
			song: song,
			lyric_id: displayLyricId,
			playerName: playerName,
			albumMode: albumMode,
			fighter: fighter,
			id: gameStats.length,
			user_id: userCookie.user_id ? userCookie.user_id : null
		})
		.then(function () {
			// console.log(response)
		})
		.catch(function (error) {			
			console.log(error);
		});
		// log results 	
		// console.log({'time': secondsElapsed, song: song, userResponse: clicked.trim(), correct: 0, album: album, lyric: displayLyric},gameStats)

		// deal with lyrics that dont have large sample size -- temporary!!!******
		if (gameStats.length > 0){
			// small sample is 287 lyrics
			var smallSample = lyricsDB.filter(x=> ((x.total || 0) < 22 || x.total == null) && !gameStats.map(y=> y.lyric_id).includes(x.id)) 			
		} else {
			var smallSample = lyricsDB.filter(x=> (x.total || 0) < 22 || x.total == null ) 
		}
		
		let playSmallSample = Math.random()
		// console.log(playSmallSample)

		// weight towards giving lyrics with small samples 
		if (playSmallSample < 0.05 && gameMode != 'album' && smallSample.length > 0){
			
			// console.log('small sample', smallSample, gameStats)

			let rand = Math.floor(Math.random() * smallSample.length)
			// change song, clear input, reset timer		
			setDisplayLyric(smallSample[rand].lyric)
			setDisplayLyricId(smallSample[rand].id)
			setSong(smallSample[rand].song.trim())
			setAlbum(smallSample[rand].album.trim())
			setAlbumKey(smallSample[rand].album_key)
			setAnsChoices(pickRandomAns(smallSample[rand].song))

		} else {
			let rand = Math.floor(Math.random() * lyricsDB.length)
			// change song, clear input, reset timer		
			setDisplayLyric(lyricsDB[rand].lyric)
			setDisplayLyricId(lyricsDB[rand].id)
			setSong(lyricsDB[rand].song.trim())
			setAlbum(lyricsDB[rand].album.trim())
			setAlbumKey(lyricsDB[rand].album_key)
			setAnsChoices(pickRandomAns(lyricsDB[rand].song))

		}
		
	
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
		setResult('')

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

	async function getPostGameReport(){
			
		// runs only if they played at least one round 

		// calc stats by album and other various stats
		// overall accuracy
		let overall = (100*gameStats.filter(x=> x.correct == 1).length/gameStats.length).toFixed(0)

		// can only make the leaderboard if answered 50 correct, accuracy > 97.5% and under 3.5s average 

		let avg_time = parseFloat((gameStats.map(x=> x.time).reduce((total, current) => total + current, 0)/gameStats.length).toFixed(2))
		let total_correct = gameStats.filter(x=> x.correct == 1).length
		// console.log(leaderboardFullDB, gameMode)

		let stats = { 'player_name' : playerName,
			'accuracy' : parseInt(overall), 
			'accuracy_rk' : 100, 		
			'time' : parseFloat((gameStats.map(x=> x.time).reduce((total, current) => total + current, 0)/gameStats.length).toFixed(2)),
			'speed_rk' : 100, 		
			'game_id' : gameId,
			'correct' : total_correct,
			'total' : gameStats.length,
			'album_mode' : albumMode, 
			'game_mode' : gameMode, 
			'fighter' : fighter, 
			'game_date' : gameDate?.toString()
		}

		// squeeze new player into leaderboard and update database if they met leaderboard reqs
		if (parseFloat(overall) > min_accuracy && total_correct > min_correct && avg_time <= 3 && gameMode != 'easy') {	

		// if (parseFloat(overall) > 3) {	// for testing
	
			let currentLeaders = leaderboardFullDB.filter(x=> x.game_mode == gameMode && x.album_mode == albumMode && x.time < avg_time)
			console.log(gameMode, albumMode, avg_time)
			let rank : number;
			let id : string | undefined;
			let id_index : number;

			// currentLeaders will be null if if you're the leader
			if (currentLeaders.length == 0) {				
				rank = 1	
				id_index = 1			
			} else {
				// if not the leader, have to get game id of relevant game so we know what rank to give it for updating table			
				id = currentLeaders.slice(-1)[0].game_id
				rank = currentLeaders.slice(-1)[0].speed_rk + 1
				id_index = currentLeaders.map(x=> x.game_id).indexOf(id)				
			}
			stats.speed_rk = rank
			
			// insert into leader board, subtract 1 bc zero indexed
			leaderboardFullDB.splice(id_index - 1, 0, stats) // need to pass an obj not an array
			// update local leader data
			setLeaderboardData(leaderboardFullDB.filter(x=> x.game_mode != 'album'))
			// update leaderboard/save to database 
			axios.post('https://swift-api.fly.dev/updateLeaderboard', stats)
			// axios.post(`http://localhost:3000/updateLeaderboard`, stats)
			.then(function () {
				// console.log(response)
			})
			.catch(function (error) {			
				console.log(error);
			});

		}

		setGameRank([stats])
		setAccuracy(overall)
	
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

		// console.log(allStatsByAlbums)

		setStatsByAlbum(allStatsByAlbums)
	
		
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
					<div onClick = {() => setPostGameDisplay('stats')} className={`era-evermore display inline-flex justify-center text-xl font-bold shadow cursor-pointer appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center ${postGameDisplay == 'stats' ? 'underline' : 'faded'}`}>long story short</div>	
					<div onClick = {() => setPostGameDisplay('leaderboard')} 
					className={`era-evermore display inline-flex justify-center text-xl font-bold shadow cursor-pointer appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center ${postGameDisplay == 'leaderboard' ? 'underline' : 'faded'}`}>swift af boi</div>
					
				</div>}

				{gameStarted && isLoading && <h2>Ah we're not ready for it, the server give me nothin' back yet. Stay, stay, stay. Don't go.</h2>}
				
				{/* <Scoreboard data={leaderboardData}/>	 */}
				{!gameStarted && !displayStats && <div className='grid grid-cols-1'>
					{!userNameSet && <div>
						<h2>So you think you're the 1? The Swiftest fan?</h2>
					<h2>How quickly can you name the song given a line?</h2>
				
					</div>}
					{!userNameSet && <div className='p-2 pt-0 flex flex-col items-center justify-center text-center transition-all ease-in-out duration-300'>
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

						<p className='announcement'>NEW: TTPD in album mode!</p>

						{!cookies.sess && <div className='announcement'> 
						Want to see yourself trying? <a className='underline font-bold' href='/hi-its-me'>Login</a> or <a className='underline font-bold' href='/rememberme'>Create an account!</a>
						</div>}
						<div className='m-2 text-center text-xs underline'>
						<p><a href="mailto:sayhello@swift-af.com">Want to Say Hello?</a></p>
						</div>

						
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
							{albumCovers.map(x=> <img src={`/icons/${x}.jpg`} key={x} className ={`albums ${(fighterChosen && fighter != x) ? 'faded' : fighterChosen && fighter == x ? 'selected' : ''}`} onClick={()=> {
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
								<div>Hard: vault songs included (no TTPD yet)</div>
								<div>Cult: TTPD + vault + a surprise ooohhh good luck</div>
								<div>the 1: focus on one album, deluxe + vault</div>
								</div>}
						</div>
						<div className='p-4 pt-0 grid grid-cols-1'>
							<div className="text-center m-4 p-2 text-md">
							{gameModes.map((x,i)=> 
							<button key={x.key}
								className={`block min-w-full cursor-pointer rounded-t-xl rounded-b-xl p-2 text-center text-md font-bold ${ltErasColors[i]} ${gameMode == x.key ? '' : 'faded'}`} id={x.key} 
								onClick={() => {
									setAlbumMode(''); 
									setGameMode(x.key);
								}}>{x.value}
							</button>)}

							<h2>or Pick an Album</h2>
							<h2>Test yourself with TTPD!</h2>
							<h6>Album dropdown will appear when you select "the 1"</h6>
							{<button 
								className={`block min-w-full cursor-pointer rounded-t-xl rounded-b-xl p-2 text-center text-md font-bold ${ltErasColors[0]} ${gameMode == 'album' ? '' : 'faded'}`} id={'album'} 
								onClick={() => {
									setAlbumMode(''); 
									setGameMode('album');
								}}>the 1 (album)
							</button>}
							
							{gameMode == 'album' && <div className='p-4 grid grid-cols-1'>
								{albums.map((x,i)=> <button className={`block min-w-full cursor-pointer rounded-t-xl rounded-b-xl text-center p-2 text-[#68416d] ${albumMode == x ? '' : 'faded'} ${albumColorKey[albumKeyLkup[x] as keyof typeof albumColorKey]}`}
								key={`${albumKeyLkup[x]}`}
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
					key={`ans_${i}`}
						onClick={() => checkAnswer(x)}> {x}</div>)}
					<h3>seconds: {secondsElapsed.toFixed(0)}</h3>
				
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
						<Leaderboard data={gameRank}/>
						{/* <div className='flex justify-center font-bold flex-row flex-wrap'>
						<h1 className={`${albumMode != '' ? albumColorKey[albumKeyLkup[albumMode]] : 'era-midnights'} shadow-md pr-4 pl-4 pt-2 pb-2 m-2`}>{accuracy}%</h1>
						<h1 className={`${albumMode != '' ? albumColorKey[albumKeyLkup[albumMode]] : 'era-midnights'} shadow-md pr-4 pl-4 pt-2 pb-2 m-2`}>{avgSpeed} sec/line</h1>
						</div> */}

						{/* <div>{gameStats.map(x=> x.correct).reduce((total, current) => total + current, 0)}/{gameStats.length} Correct 
						</div>					
						<div>{(gameStats.map(x=> x.time).reduce((total, current) => total + current, 0)/gameStats.length).toFixed(2)} seconds per lyric</div>					 */}
												
						{gameStats.filter(x=> x.correct == 1).length > 0 && 
							<div className='gamestats'>
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
											{gameStats.filter(x=> x.correct == 1).map((x,i) =><tr className={`text-center text-[#68416d] ${albumColorKey[x.album_key as keyof typeof albumColorKey]}`}
											key={`correct_${i}`}
											>
												<td className="border p-1">{x.lyric}</td>
												<td className="border p-1">{x.song}</td>
												<td className="border p-1">{x.time.toFixed(1)}s</td>
											</tr>)}		
										</tbody>
									</table>
							</div>
						}
								
						{gameStats.filter(x=> x.correct == 0).length > 0 &&
						<div className='gamestats'>
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
									{gameStats.filter(x=> x.correct == 0).map((x,i) =><tr  className={`text-center text-[#513355] ${albumColorKey[x.album_key]}`}
									key={`wrong_${i}`}>
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
									{statsByAlbum.map(x =><tr className={`text-center text-[#68416d] ${albumColorKey[x.albumKey as keyof typeof albumColorKey]}`}
									key={`${x.albumKey}`}
									>
										<td className="border p-1">{x.album}</td>
										<td className="border p-1">{x.correct}/{x.total}</td>
										<td className="border p-1">{x.avgTime}</td>
									</tr>)}		
								</tbody>					

							</table>
						</div>}
					</div>}
					{postGameDisplay == 'leaderboard' && !isLoading && <div>
						<div className='flex flex-row m-2 p-2 font-bold text-center justify-center'>
							<div className={`${filterLeaderboard == 'all' ? 'era-reputation' : 'faded'} inline p-2 min-w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
								onClick={() => setFilterLeaderboard('all')}>The Eras</div>
							<div className={`${filterLeaderboard == 'album' ? 'era-reputation' : 'faded'} inline p-2 min-w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
								onClick={() => setFilterLeaderboard('album')}>By Album</div>
						</div>
						<Leaderboard data={leaderboardData}/>
						<h6 className='text-sm'>{`Minimum ${min_correct} correct and ${min_accuracy}% accuracy.  No easy mode.  Filter subject to change.`}</h6>
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

