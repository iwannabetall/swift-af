// import { useState, useRef, FormEvent } from 'react'
import { useState, useRef, useEffect } from 'react'
// import ReactDOM from 'react-dom';
import title from '/title.svg'

import axios from 'axios';

function App() {
	
	const ltErasColors = ['eras_green', 'eras_gold', 'eras_purple', 'eras_lblue', 'eras_pink', 'eras_maroon', 'eras_indigo', 'eras_tan', 'eras_grey'];

	// let songList: SongList[] = []
	// let lyricsDB: Lyrics[] = []

	const intervalRef: {current: NodeJS.Timeout | null } = useRef(null);
	// const intervalRef = useRef<ReturnType<typeof setInterval> | null>()  // ref for stopwatch interval

	const [startTime, setStartTime] = useState<number>(0.0)
	const [currentTime, setCurrentTime] = useState<number>(0.0)
	const [userResponse, setUserResponse] = useState<string>('')
	const [randNum, setRandNum] = useState<number>(0) // do i need this??
	const [displayLyric, setDisplayLyric] = useState<string>('')
	const [song, setSong] = useState<string>('')
	const [album, setAlbum] = useState<string>('')
	
	const [songList, setSongList] = useState<SongList[]>([])
	const [lyricsDB, setLyricsDB] = useState<Lyrics[]>([])
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
		axios.get(`https://swift-api.fly.dev/getSongs`)
			.then(function (response) {	
				setSongList(response.data.songList)
			})
			.catch(function (error) {				
				console.log(error);
			});	

			axios.get(`https://swift-api.fly.dev/getLyrics`)
			.then(function (response) {	
				setLyricsDB(response.data.lyrics)
				// setPlayerList(response.data.playerList)
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

	// function submitAnswer(e: FormEvent<HTMLFormElement>) {

	// 	e.preventDefault()
	// 	console.log(song, userResponse)
	// 	// check if right answer 
	// 	console.log(song, userResponse, song.trim().toLowerCase() == userResponse.trim().toLowerCase())
	// 	// check if right answer
	// 	if (song.trim().toLowerCase() == userResponse.trim().toLowerCase()){ 
	// 		setResult('Correct!')
	// 		setGameStats([{'time': secondsElapsed, song: song, userResponse: userResponse, correct: 1, album: album, lyric: displayLyric}, ...gameStats])
	// 	} else {
	// 		setResult(wrongAnswersOnly[Math.floor(Math.random() * wrongAnswersOnly.length)])
	// 		setGameStats([{'time': secondsElapsed, song: song, userResponse: userResponse, correct: 0, album: album, lyric: displayLyric}, ...gameStats])
	// 	}

	// 	// log results 
	// 	let rand = Math.floor(Math.random() * lyrics.length)

	// 	console.log(gameStats)
		
	// 	// change song, clear input, reset timer
	// 	setRandNum(Math.floor(Math.random() * lyrics.length))
	// 	setDisplayLyric(lyrics[rand].lyrics)
	// 	setSong(lyrics[rand].song.trim())
	// 	setAlbum(lyrics[rand].album.trim())
	// 	setAnsChoices(pickRandomAns(lyrics[rand].song))
	// 	setUserResponse('')
		
	// 	setStartTime(Date.now())
	// 	setCurrentTime(Date.now())

	// }


	// start timer for beg of game 
	function startGame() {
		
		console.log('start game')
		
		setDisplayStats(false) // in case you're starting another game

		setStartTime(Date.now())
		setCurrentTime(Date.now())
		setGameStats([])
		setGameStarted(true)

		const randInd = Math.floor(Math.random() * lyricsDB.length)
		setRandNum(randInd) 
		clearInterval(intervalRef.current as NodeJS.Timeout)
		// start timer and display a lyric 
		setAnsChoices(pickRandomAns(lyricsDB[randInd].song))
		setDisplayLyric(lyricsDB[randInd].lyric)
		setSong(lyricsDB[randInd].song.trim())
		setAlbum(lyricsDB[randInd].album.trim())
		intervalRef.current = setInterval(() => setCurrentTime(Date.now()), 10)		
		// console.log(randInd, lyricsDB[randInd])

	}

	function checkAnswer(clicked: string) {
		console.log('wtf2', lyricsDB, songList)
		// console.log(clicked == song, song, clicked)
		if (song.trim() == clicked.trim()){ 
			setResult('Correct!')
			setGameStats([{'time': secondsElapsed, song: song, userResponse: clicked.trim(), correct: 1, album: album, lyric: displayLyric}, ...gameStats])
		} else {
			setResult(wrongAnswersOnly[Math.floor(Math.random() * wrongAnswersOnly.length)])
			setGameStats([{'time': secondsElapsed, song: song, userResponse: clicked.trim(), correct: 0, album: album, lyric: displayLyric}, ...gameStats])
		}

		// log results 
		
		// console.log({'time': secondsElapsed, song: song, userResponse: clicked.trim(), correct: 0, album: album, lyric: displayLyric},gameStats)
		let rand = Math.floor(Math.random() * lyricsDB.length)
		// change song, clear input, reset timer
		setRandNum(rand)

		setDisplayLyric(lyricsDB[rand].lyric)
		setSong(lyricsDB[rand].song.trim())
		setAlbum(lyricsDB[rand].album.trim())
		setAnsChoices(pickRandomAns(lyricsDB[rand].song))
		setUserResponse('')
		
		setStartTime(Date.now())
		setCurrentTime(Date.now())

	}

	function endGame(){
		console.log('end game')

		// end game and show game stats
		setGameStarted(false)
		setDisplayStats(true)
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
					<h2>So you think you're the #1 Swift fan?</h2>
					<h2>How quickly can you ID the song?</h2>
					<h6>It's time to go</h6>
					<button className='m-6 bg-eras_grey p-4' onClick={() => startGame()}>...Ready For It?</button>
				</div>}

				{gameStarted && !displayStats && <div className=''>
					<div className='font-bold text-xl text-center p-2'>{displayLyric}</div>

					{answerChoices.map((x,i) => <div className={`cursor-pointer rounded-t-xl rounded-b-xl text-center m-4 p-2 text-lg font-bold ${ltErasColors[i]}`}
						onClick={() => checkAnswer(x)}> {x}</div>)}

					<div>{lyricsDB[3].album}</div>
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
						<button className='m-6 bg-eras_grey p-4' onClick={() => setGameStarted(false)}>Begin Again</button>
						<button className='m-6 bg-eras_grey p-4' onClick={() => endGame()}>End Game</button>
					</div>				

					<div className=''>{song}</div>
					<div>{result}</div>
					<h3>{secondsElapsed.toFixed(3)}</h3>
					
				</div>}

				{(gameStats.length > 0) && displayStats && <div>
					<div>long story short</div>
					<div>{gameStats.map(x=> x.correct).reduce((total, current) => total + current, 0)}/{gameStats.length} Correct 
					</div>
					<div>
					{(gameStats.map(x=> x.time).reduce((total, current) => total + current, 0)/gameStats.length).toFixed(2)} seconds per lyric</div>
					<button className='m-6 bg-eras_grey p-4' onClick={() => startGame()}>Begin Again</button>
					</div>}
			

				<p>What's my End Game?</p>
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

