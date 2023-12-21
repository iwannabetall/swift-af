import { useState, useEffect } from 'react'
import title from '/title.svg'
import axios from 'axios';
import Nav from './Nav.tsx'
import moment from 'moment';

let leaderboardFullDB: Leaderboard[] = []

function LeaderboardPage() {
	
	const min_accuracy = 60;
	const min_correct = 10;
	
	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights'} as const

	const albumKeyLkup = { "Taylor Swift" : "Taylor_Swift", "Fearless" : "Fearless", "Speak Now" : "Speak_Now", 'Red' : 'Red', '1989' : '1989', 'reputation' : 'reputation', 'Lover' : 'Lover', 'folklore' : 'folklore', 'evermore' : 'evermore', 'Midnights' : 'Midnights'} as const

	const [leaderboardData, setLeaderboardData] = useState<Leaderboard[]>([])

	const [isLoading, setIsLoading] = useState<boolean>(false)

	const [filterLeaderboard, setFilterLeaderboard] = useState<filterLeaderboard>('all')

	useEffect(() => {
		delayedDataFetch()					
	}, [])

	useEffect(()=> {
		if (filterLeaderboard == 'all') {
			setLeaderboardData(leaderboardFullDB.filter(x=> x.game_mode != 'album'))
		} else {
			setLeaderboardData(leaderboardFullDB.filter(x=> x.game_mode == 'album'))
		}
		
	}, [filterLeaderboard])

	async function delayedDataFetch() {
		setIsLoading(true)
		// axios.get(`http://localhost:3000/getLeaderboard`)
		axios.get(`https://swift-api.fly.dev/getLeaderboard`)
		.then(function (response) {								
			leaderboardFullDB = response.data.leaderBoard
			// console.log(leaderboardFullDB)
			setLeaderboardData(leaderboardFullDB.filter(x=> x.game_mode != 'album'))
			setIsLoading(false)
		})
		.catch(function (error) {				
			console.log(error);
		});	
	}

	return (
		<>
			<Nav location={location}></Nav>
			{isLoading && <div>
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />	
				</div>
				<h2>Wait, don't go. Getting the swiftest swifties!</h2></div>}
			{!isLoading && <div className='grid grid-cols-1 p-2 justify-items-center mt-20 lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2 justify-center'>
				
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />				
				</div>	
				
				<div className='flex flex-col container bold text-center justify-center items-center'>
					<div className='flex flex-row container bold text-center justify-center'>
						<div className={`${filterLeaderboard == 'all' ? 'era-reputation' : 'faded'} inline p-2 min-w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
							onClick={() => setFilterLeaderboard('all')}>All</div>
						<div className={`${filterLeaderboard == 'album' ? 'era-reputation' : 'faded'} inline p-2 min-w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
							onClick={() => setFilterLeaderboard('album')}>By Album</div>
					</div>
					<h6 className='text-sm'>{`Minimum ${min_correct} correct and ${min_accuracy}% accuracy.  No easy mode.  Filter subject to change.`}</h6>
					{leaderboardData && <div className='flex flex-row flex-wrap items-center justify-center'>
						{leaderboardData.map(x=> <div key={x.game_id} className={`leaderboardContainer ${x.game_mode == 'album' ? albumColorKey[albumKeyLkup[x.album_mode as keyof typeof albumKeyLkup]] : 'era-reputation '} text-center m-4 p-2 shadow-md rounded`}>
							<img className='albums' src={`/icons/${x.fighter}.jpg`}></img>
							<div className='m-2 text-xl font-bold'>{x.speed_rk == 1 ? '🏆' : x.speed_rk == 2 ? '🥈' : x.speed_rk == 3 ? '🥉' : '⭐'} {x.player_name} {x.speed_rk == 1 ? '🏆' : x.speed_rk == 2 ? '🥈' : x.speed_rk == 3 ? '🥉' : '⭐'} </div>
							<span className='italic text-sm'>{moment(x.game_date).format('MMM D, YYYY')}</span>
							<div className='flex flex-col m-2'>
								<div className='text-xl mb-1'>speed: {x.time.toFixed(2)}s</div>	
								<div className='text-xl mb-1'>accuracy: {x.correct}/{x.total} ({x.accuracy.toFixed(0)}%)</div>
							</div>
							<div className={`text-sm italic`}>{x.game_mode == 'album' ? x.album_mode : x.game_mode}</div>
							<div className='mt-1'>Can you beat me? swift-af.com</div>
							</div>)}
						</div>
					}					
				</div>
				
			</div>}
		</>
	)

}

export default LeaderboardPage