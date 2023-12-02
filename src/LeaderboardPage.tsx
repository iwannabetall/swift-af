import { useState, useEffect } from 'react'
import title from '/title.svg'
import axios from 'axios';
import Nav from './Nav.tsx'

let leaderboardFullDB: Leaderboard[] = []

function LeaderboardPage() {
	
	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights'} as const

	const albumKeyLkup = { "Taylor Swift" : "Taylor_Swift", "Fearless" : "Fearless", "Speak Now" : "Speak_Now", 'Red' : 'Red', '1989' : '1989', 'reputation' : 'reputation', 'Lover' : 'Lover', 'folklore' : 'folklore', 'evermore' : 'evermore', 'Midnights' : 'Midnights'} as const

	const [leaderboardData, setLeaderboardData] = useState<Leaderboard[]>([])

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
		axios.get(`http://localhost:3000/getLeaderboard`)
		.then(function (response) {								
			leaderboardFullDB = response.data.leaderBoard
			console.log(leaderboardFullDB)
			setLeaderboardData(leaderboardFullDB.filter(x=> x.game_mode != 'album'))
		})
		.catch(function (error) {				
			console.log(error);
		});	
	}

	return (
		<>
			<Nav location={location}></Nav>
			<div className='grid grid-cols-1 p-4 items-center mt-20 lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2'>
				
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />				
				</div>	
				
				<div className='flex flex-col m-2 p-2 bold text-center justify-center'>
					<div className='flex flex-row m-2 p-2 bold text-center justify-center'>
						<div className={`${filterLeaderboard == 'all' ? 'era-reputation' : 'faded'} inline p-2 min-w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
							onClick={() => setFilterLeaderboard('all')}>All</div>
						<div className={`${filterLeaderboard == 'album' ? 'era-reputation' : 'faded'} inline p-2 min-w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
							onClick={() => setFilterLeaderboard('album')}>By Album</div>
					</div>
					{leaderboardData && <table className='mb-4'>
						<thead>
							<tr>
							<th>Player</th>
							<th>Speed</th>
							<th>Accuracy</th>
							<th>Mode</th>
							</tr>
						</thead>
						<tbody>
							{leaderboardData.map(x =><tr key={x.game_id} className={`${albumColorKey[albumKeyLkup[x.album_mode as keyof typeof albumKeyLkup]]} text-center`}>
								<td className="border p-1">{x.player_name}</td>
								<td className="border p-1">{x.time.toFixed(2)}s</td>
								<td className="border p-1">{x.correct}/{x.total} ({x.accuracy.toFixed(0)}%)</td>
								<td className="border p-1">{x.game_mode == 'album' ? x.album_mode : x.game_mode} </td>
							</tr>)}		
						</tbody>
					</table>}
				</div>
				<h3>Minimum 8 correct and 50% accuracy.  No easy mode</h3>
			</div>
		</>
	)

}

export default LeaderboardPage