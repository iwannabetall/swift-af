// import { useState, useRef, FormEvent } from 'react'
import { useState, useRef, useEffect } from 'react'
// import ReactDOM from 'react-dom';
import title from '/title.svg'
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

let lyricsFullDB: Lyrics[] = [] // all lyrics 
let songsFullDB: SongList[] = [] // all songs 

function App() {
	
	const gameDate = new Date()
	const ltErasColors = ['eras_green', 'eras_gold', 'eras_purple', 'eras_lblue', 'eras_pink', 'eras_maroon', 'eras_indigo', 'eras_tan', 'eras_grey', 'eras_black'];

	// const albumColorKey = [{'Taylor Swift': 'eras_green'}, {'Fearless': 'eras_gold'}, {'Speak Now': 'eras_purple'}, {'Red': 'eras_maroon'}, {'1989': 'eras_lblue'}, {'reputation': 'eras_black'}, {'Lover': 'eras_pink'}, {'folklore': 'eras_grey'}, {'evermore': 'eras_tan'}, {'Midnights': 'eras_indigo'}]
	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights'} as const

	// const gameModes = {'easy': 'this is me trying', 'normal': 'The Classics', 'hard': "Taylor's Version", 'expert': 'my tears richochet' } 
	const gameModes = [{'key' : 'easy', 'value' : 'this is me trying (easy)'}, {'key' : 'normal', 'value' : "The Classics (rec'd)"}, {'key' : 'hard', 'value' : "Taylor's Version (hard)"}, {'key' : 'expert', 'value' : 'my tears richochet (expert)'}] as const

	// const albumList = ['Taylor Swift', 'Fearless', 'Speak Now', 'Red', '1989', 'reputation', 'Lover', 'folklore', 'evermore', 'Midnights']

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

 	const [answerChoices, setAnsChoices] = useState<string[]>([])
	const [result, setResult] = useState<string>() // true, false, null? 
	const [gameStats, setGameStats] = useState<GameStats[]>([])  // make this an array of objects with lyric/song/album they got right and the time
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
				console.log(songsFullDB)
			})
			.catch(function (error) {				
				console.log(error);
			});	

			// axios.get(`https://swift-api.fly.dev/getLyrics`)
			axios.get(`http://localhost:3000/getLyrics`)
			.then(function (response) {	
				setLyricsDB(response.data.lyrics)
				lyricsFullDB = response.data.lyrics
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
		console.log('lyricsFullDB', lyricsFullDB)
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
		
		console.log('start game', lyricsDB)
		
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
		console.log(gameId)
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
			setGameStats([{'time': secondsElapsed, song: song, userResponse: clicked.trim(), correct: 1, album: album, lyric: displayLyric, album_key: albumKey, level: gameMode, lyric_id: displayLyricId}, ...gameStats])

		} else {
			correct = 0
			setResult(wrongAnswersOnly[Math.floor(Math.random() * wrongAnswersOnly.length)])
			setGameStats([{'time': secondsElapsed, song: song, userResponse: clicked.trim(), correct: 0, album: album, lyric: displayLyric, album_key: albumKey, level: gameMode, lyric_id: displayLyricId}, ...gameStats])
		}

		
		// save results before resetting
		axios.post('http://localhost:3000/saveGameData', {
			level: gameMode,
			time: secondsElapsed, 
			lyric: displayLyric,
			correct: correct, 
			date: `${gameDate.getFullYear()}-${gameDate.getMonth()+1}-${gameDate.getDate()}`,
			gameId: gameId,
			song: song,
			lyric_id: displayLyricId
		})
		.then(function (response) {
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

	function restartGame(){
		// goes to home page where you can change levels/user names
		setGameId(uuidv4())		
		setDisplayStats(false)
		setGameStarted(false)
	}

	function endGame(){
		
		// end game and show game stats
		setGameStarted(false)
		if (gameStats.length > 0) {
			setDisplayStats(true)
		} 
		
	}
	
	let secondsElapsed = 0;
  if (startTime != null && currentTime != null) {
    secondsElapsed = (currentTime - startTime) / 1000;
  }
	
  return (
    <>
			<div className='md:flex flex-col p-4'>
				<div>
					<img src={title} className={`logo p-4 ${(gameStarted || displayStats) ? 'max-h-32' : ''}`} alt="Swift AF" />				
				</div>
				
				{!gameStarted && !displayStats && <div className='grid grid-cols-1'>
					<h2>So you think you're the 1? The Swiftest fan?</h2>
					<h2>How quickly can you ID the song?</h2>
					<h6>Pick a level.  It's time to go</h6>
					<div className='p-4 pt-0 grid grid-cols-1'>
						<div className="text-center m-4 p-2 text-md">
						{gameModes.map((x,i)=> <div className={`cursor-pointer rounded-t-xl rounded-b-xl p-2 text-center text-md font-bold ${ltErasColors[i]} ${gameMode == x.key ? '' : 'faded'}`} id={x.key} onClick={() => setGameMode(x.key)}>{x.value}</div>)}
						
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
						
						<button className='m-4 bg-eras_grey p-4 text-lg font-bold' onClick={() => startGame()}>...Ready For It</button>
					</div>
				</div>}

				{gameStarted && !displayStats && <div className=''>					
					<div className='font-bold text-xl text-center p-2'>
						{displayLyric}</div>

					{answerChoices.map((x,i) => <div className={`cursor-pointer rounded-t-xl rounded-b-xl text-center m-4 p-2 text-lg font-bold ${ltErasColors[i]}`}
						onClick={() => checkAnswer(x)}> {x}</div>)}
				<h3>{secondsElapsed.toFixed(3)}</h3>
					{/* <form onSubmit={(e: FormEvent<HTMLFormElement>) => submitAnswer(e)}>
						<label> What song is it?!
							<input type='text' value={userResponse} onChange={e => setUserResponse(e.target.value)}>
							</input>
						</label>
					</form>				 */}
					<div className='text-lg font-bold m-4 p-2'>
					{gameStats.length > 0 ? <div>{gameStats.map(x=> x.correct).reduce((total, current) => total + current, 0)}/{gameStats.length} Correct {(100*gameStats.map(x=> x.correct).reduce((total, current) => total + current, 0)/gameStats.length).toFixed(0)}%</div> : ''}
					</div>

					<div className='md:flex justify-center'>
						<button className='m-6 bg-eras_grey p-4' onClick={() => restartGame()}>Begin Again</button>
						<button className='m-6 bg-eras_grey p-4' onClick={() => endGame()}>End Game</button>
					</div>				

					<div>{result}</div>
									
				</div>}

				{(gameStats.length > 0) && displayStats && <div>
					<div>long story short</div>
					<div>{gameStats.map(x=> x.correct).reduce((total, current) => total + current, 0)}/{gameStats.length} Correct 
					</div>

					
					<div>{(gameStats.map(x=> x.time).reduce((total, current) => total + current, 0)/gameStats.length).toFixed(2)} seconds per lyric</div>					
					
					{gameStats.filter(x=> x.correct == 1).length > 0 && <table>
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
					</table>}

							
					{gameStats.filter(x=> x.correct == 0).length > 0 &&
					<div className=''>
						<h3 className='font-bold text-xl text-center'>Would've, Could've, Should've</h3>
						<table>
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

