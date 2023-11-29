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


let lyricsFullDB: Lyrics[] = [] // all lyrics 
let songsFullDB: SongList[] = [] // all songs 

function App() {
	
	const gameDate = new Date()
	const ltErasColors = ['eras_green', 'eras_gold', 'eras_purple', 'eras_lblue', 'eras_pink', 'eras_maroon', 'eras_indigo', 'eras_tan', 'eras_grey', 'eras_black'];

	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights'} as const

	const gameModes = [{'key' : 'easy', 'value' : 'this is me trying (easy)'}, {'key' : 'normal', 'value' : "The Classics (rec'd)"}, {'key' : 'hard', 'value' : "Taylor's Version (hard)"}, {'key' : 'expert', 'value' : 'my tears richochet (expert)'}] as const

	const albums = ["Taylor Swift", "Fearless", "Speak Now", "Red", "1989", "reputation", "Lover", "folklore", "evermore", "Midnights"] as const

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
	const [gameMode, setGameMode] = useState<string>('normal')
	const [showGameModeQ, setShowGameModeQ] = useState<boolean>(false)
	const [songList, setSongList] = useState<SongList[]>([])
	const [lyricsDB, setLyricsDB] = useState<Lyrics[]>([])
	const [gameId, setGameId] = useState<string>(uuidv4())
	const [playerName, setPlayerName] = useState<string>('')
	const [userNameSet, setUserNameSet] = useState<boolean>(false)

	const [accuracy, setAccuracy] = useState<string | undefined>()
	const [avgSpeed, setAvgSpeed] = useState<string | undefined>()
 	const [answerChoices, setAnsChoices] = useState<string[]>([])
	const [result, setResult] = useState<string>() // true, false, null? 
	const [gameStats, setGameStats] = useState<GameStats[]>([])  // make this an array of objects with lyric/song/album they got right and the time
	const [statsByAlbum, setStatsByAlbum] = useState<StatsByAlbum[]>([])
	const [gameStarted, setGameStarted] = useState<boolean>(false)
	const [displayStats, setDisplayStats] = useState<boolean>(false);

	const wrongAnswersOnly = ["This is why we can't have nice things", "Would you like closure and know the song", "Is this you trying", "It's you, you're the problem", "Not sure how long we're gonna tolerate this for", "I wish you would get the right answer", "That was not the 1", "you'll have an ephiphany on it later", "Made my tears richochet with that one","You forgot that song existed", "Death by a thousand wrongs", "False Swiftie", "You're on your own, kid", "Answer...?", "brain Glitch", "I bet you'll think about that", "You did something bad", "Typing with your hands tied?", "Exhiling you", "tis not the damn song", "Shake it off", "Clean slate", "That was sweet nothing"]

	useEffect(() => {
		delayedDataFetch()					
	}, [])
	
	async function delayedDataFetch() {

		console.log('get data')
		// get song list 
		// axios.get(`https://swift-api.fly.dev/getSongs`)
		axios.get(`http://localhost:3000/getSongs`)
			.then(function (response) {	
				setSongList(response.data.songList)
				songsFullDB = response.data.songList
				// console.log(songsFullDB)
			})
			.catch(function (error) {				
				console.log(error);
			});	

			// axios.get(`https://swift-api.fly.dev/getLyrics`)
			axios.get(`http://localhost:3000/getLyrics`)
			.then(function (response) {								
				lyricsFullDB = response.data.lyrics
				updateLyricsDB(gameMode)
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
		let songIndices = Array(songList.length).fill(1).map((x,i) => x + i)
		// remove the song that is the answer so we don't get dupes
		songIndices.splice(songList.map(x=> x.song).indexOf(correctAnswer), 1)

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


	function updateLyricsDB(level: string){
		// filter/set the lyrics 		
		// console.log('lyricsFullDB', level, lyricsFullDB)
		if (level == 'easy'){
			setLyricsDB(lyricsFullDB.filter(x=> x.filler == 0 && x.vault == 0))
			setSongList(songsFullDB.filter(x=> x.vault == 0))
		} else if (level == 'normal') {
			setLyricsDB(lyricsFullDB.filter(x=> x.filler == 0 && x.vault == 0 && x.title_in_lyric_match < 70))
			setSongList(songsFullDB.filter(x=> x.vault == 0))
		} else if (level == 'hard') {
			// hard is all + more recent vault songs but no filler
			setLyricsDB(lyricsFullDB.filter(x=> x.filler == 0 && x.title_in_lyric_match < 70))
			setSongList(songsFullDB)
		} else {
			// expert level has vault songs, filler words, and 
			setLyricsDB(lyricsFullDB.filter(x=> x.title_in_lyric_match < 70))
			setSongList(songsFullDB)
		}
		
	}

	// start timer for beg of game 
	function startGame() {
		
		// console.log('start game', lyricsDB)
		
		setDisplayStats(false) // in case you're starting another game

		setStartTime(Date.now())
		setCurrentTime(Date.now())
		setGameStats([])
		setGameStarted(true)
		setGameId(uuidv4())

		updateLyricsDB(gameMode)

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
		axios.post('http://localhost:3000/saveGameData', {
		// axios.post('https://swift-api.fly.dev/saveGameData', {
			level: gameMode,
			time: secondsElapsed, 
			lyric: displayLyric,
			correct: correct, 
			date: `${gameDate.getFullYear()}-${gameDate.getMonth()+1}-${gameDate.getDate()}`,
			gameId: gameId,
			song: song,
			lyric_id: displayLyricId,
			playerName: playerName
		})
		.then(function (response) {
			console.log(response)
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

	}

	function restartGame(){
		// goes to home page where you can change levels/user names
		setGameId(uuidv4())		
		setDisplayStats(false)
		setGameStarted(false)
	}

	function endGame(){
	
		// sort gamestats so it's clumped by album
		setGameStats(gameStats.sort((a,b) => (a.album > b.album) ? 1 : (b.album > a.album) ? -1 : 0))

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
			console.log((100*gameStats.filter(x=> x.correct == 1).length/gameStats.length).toFixed(0))

			setAccuracy(overall)

			setAvgSpeed((gameStats.map(x=> x.time).reduce((total, current) => total + current, 0)/gameStats.length).toFixed(2))
		
			let allStatsByAlbums: StatsByAlbum[] = []

			for (let i = 0; i < albums.length; i++) {
				let calcStats: StatsByAlbum = {}
				calcStats.album = albums[i]				

				let albumStats = gameStats.filter(x=> x.album == albums[i])

				if (albumStats.length > 0) {
					calcStats.correct = albumStats.filter(x=> x.correct).length
					calcStats.total = albumStats.length
					calcStats.avgTime = albumStats.map(x=> x.time).reduce((acc,curr) => acc + curr, 0).toFixed(2)
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
			<div className='md:flex flex-col p-4 items-center'>
				<div className=''>
					<img src={title} className={`logo p-4 ${(gameStarted || displayStats) ? 'max-h-32' : ''}`} alt="Swift AF" />				
				</div>
				
				{!gameStarted && !displayStats && <div className='grid grid-cols-1'>
					{!userNameSet && <div>
						<h2>So you think you're the 1? The Swiftest fan?</h2>
					<h2>How quickly can you ID the song?</h2>
					</div>}
					{!userNameSet && <div className='p-4 pt-0 grid grid-cols-1 text-center transition-all ease-in-out duration-300'>
						<form className="era-evermore cursor-pointer shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={(e: FormEvent<HTMLFormElement>) => submitUserName(e)}>
							<label className='block'> the leaderboard has a blank space
								<input className="shadow cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" type='text' 
								value={playerName} 
								placeholder='Your display name'
								maxLength={30}
								onChange={e => setPlayerName(e.target.value)}>
								</input>
							</label>
							<button className='cursor-pointer'>1, 2, 3, LGB </button>
						</form>
					</div>}
					{userNameSet && <div>

						<div className='pr-4 pl-4 pt-0 grid grid-cols-1'>
						
						<button className="era-folklore cursor-pointer p-2 m-4 shadow-md rounded-t-xl rounded-b-xl" onClick={() => setUserNameSet(false)}><img src={leftarrow} className='cursor-pointer inline logo h-8 mr-2 pr-2 ' alt="change name" />
								cursing my display name, wishing I wasn't {playerName}
							</button>
						</div>
							{/* the old {playerName} is dead */}
							<h6>Pick a level.  It's time to go</h6>
						
						<div className='p-4 pt-0 grid grid-cols-1'>
							<div className="text-center m-4 p-2 text-md">
							{gameModes.map((x,i)=> <button className={`block min-w-full cursor-pointer rounded-t-xl rounded-b-xl p-2 text-center text-md font-bold ${ltErasColors[i]} ${gameMode == x.key ? '' : 'faded'}`} id={x.key} onClick={() => setGameMode(x.key)}>{x.value}</button>)}
							
							<div onClick={() => setShowGameModeQ(!showGameModeQ)}
							className="cursor-pointer rounded-t-xl rounded-b-xl text-center text-md font-bold m-4" 
							>Question...?</div>
							{showGameModeQ && <div>
								<div>Easy mode: song title might be in the lyric</div>
								<div>Normal mode: lyrics with song title removed</div>
								<div>Hard mode: vault songs included</div>
								<div>Expert mode: vault songs + a surprise ooohhh</div>
								</div>
								}

							</div>
							
							{playerName && <button className='m-4 era-reputation p-4 text-lg font-bold rounded-t-xl rounded-b-xl' onClick={() => startGame()}>...Ready For It</button>}
						</div>
					</div>}
				</div>}

				{gameStarted && !displayStats && <div className=''>					
					<div className='font-bold text-xl text-center p-2'>
						{displayLyric}</div>

					{answerChoices.map((x,i) => <div className={`cursor-pointer rounded-t-xl rounded-b-xl text-center m-4 p-2 text-lg font-bold ${ltErasColors[i]}`}
						onClick={() => checkAnswer(x)}> {x}</div>)}
				<h3>{secondsElapsed.toFixed(3)}</h3>
				
					<div className='text-lg font-bold m-4 p-2'>
					{gameStats.length > 0 ? <div>{gameStats.map(x=> x.correct).reduce((total, current) => total + current, 0)}/{gameStats.length} Correct {(100*gameStats.map(x=> x.correct).reduce((total, current) => total + current, 0)/gameStats.length).toFixed(0)}%</div> : ''}
					</div>

					<div className='md:flex justify-center'>
						<button className='m-6 bg-eras_grey p-4' onClick={() => restartGame()}>Begin Again</button>
						<button className='m-6 bg-eras_grey p-4' onClick={() => endGame()}>End Game</button>
					</div>				

					<div>{result}</div>
									
				</div>}

				{(gameStats.length > 0) && displayStats && <div className='p-4 pt-0 grid grid-cols-1'>
					<h3 className='font-bold text-xl text-center'>long story short for your {gameStats.length} tries</h3>
					<div className='font-bold text-xl text-center p-2'>{accuracy < 40 ? "Shake it off, soon you'll get better" : accuracy > 70 ? "I knew I saw a light in you, Superstar" : ''}</div>
					<div className='flex justify-center font-bold flex-row flex-wrap'>
					<h1 className='era-midnights shadow-md pr-4 pl-4 pt-2 pb-2 m-2'>{accuracy}%</h1>
					<h1 className='era-midnights shadow-md pr-4 pl-4 pt-2 pb-2 m-2'>{avgSpeed} sec/line</h1>
					</div>

					{/* <div>{gameStats.map(x=> x.correct).reduce((total, current) => total + current, 0)}/{gameStats.length} Correct 
					</div>					
					<div>{(gameStats.map(x=> x.time).reduce((total, current) => total + current, 0)/gameStats.length).toFixed(2)} seconds per lyric</div>					 */}
					
					<h3 className='font-bold text-xl text-center'>happiness</h3> 
					{gameStats.filter(x=> x.correct == 1).length > 0 && 
						
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
					{statsByAlbum.length > 0 && gameStats.length > 10 && <div>
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

				<button className='m-6 bg-eras_grey p-4' onClick={() => restartGame()}>Begin Again</button>					
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

