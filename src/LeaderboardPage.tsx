import { useState, useEffect } from 'react'
import axios from 'axios';
import moment from 'moment';
import Layout from './Layout.tsx';
import * as TS from './Constants.tsx'

let leaderboardFullDB: Leaderboard[] = []

function LeaderboardPage() {
	
	const min_accuracy = 97.5;
	const min_correct = 50;
	const URL = TS.config.url

	const albumColorKey = TS.albumColorKey
	const albumKeyLkup = TS.albumKeyLkup

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
		
		axios.get(`${URL}/getLeaderboard`)
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

	return (
		<>			
				<Layout isLoading={isLoading}>
				<div className='flex flex-col container bold text-center justify-center items-center'>
					<div className='flex flex-row container bold text-center justify-center'>
						<div className={`${filterLeaderboard == 'all' ? 'era-reputation' : 'faded'} inline p-2 min-w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
							onClick={() => setFilterLeaderboard('all')}>All</div>
						<div className={`${filterLeaderboard == 'album' ? 'era-reputation' : 'faded'} inline p-2 min-w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
							onClick={() => setFilterLeaderboard('album')}>By Album</div>
					</div>
					<h6 className='text-sm'>{`Minimum ${min_correct} correct and ${min_accuracy}% accuracy.  No easy mode.  Filter subject to change.`}</h6>
					{leaderboardData && <div className='flex flex-row flex-wrap items-center justify-center'>
						{leaderboardData.map(x=> <div key={x.game_id} className={`leaderboardContainer ${x.game_mode == 'album' ? albumColorKey[albumKeyLkup[x.album_mode as keyof typeof albumKeyLkup]] : x.game_mode == "Taylor's Version" ? 'era-midnights' : x.game_mode == 'classics version' ? 'era-reputation' : x.game_mode == 'The Eras' ? 'era-evermore' : x.game_mode == 'Tortured Classics' ? 'era-folklore' : 'era-red'} text-center m-4 p-2 shadow-md rounded`}>
							<img className='albums' src={`/icons/${x.fighter}.jpg`}></img>
							<div className='m-2 text-xl font-bold'>{x.speed_rk == 1 ? '🏆' : x.speed_rk == 2 ? '🥈' : x.speed_rk == 3 ? '🥉' : '⭐'} {x.player_name} {x.speed_rk == 1 ? '🏆' : x.speed_rk == 2 ? '🥈' : x.speed_rk == 3 ? '🥉' : '⭐'} </div>
							<span className='italic text-sm'>{moment(x.game_date).format('MMM D, YYYY')}</span>
							<div className='flex flex-col m-2'>
								<div className='text-xl mb-1'>speed: {x.time.toFixed(2)}s</div>	
								<div className='text-xl mb-1'>accuracy: {x.correct}/{x.total} ({x.accuracy.toFixed(0)}%)</div>
							</div>
							<div className={`text-sm italic`}>{x.game_mode == 'album' ? x.album_mode : x.game_mode}</div>
							<div className='mt-1'>Try and come for my spot: swift-af.com</div>
							</div>)}
						</div>
					}	
				</div>
				</Layout>
		</>
	)

}

export default LeaderboardPage