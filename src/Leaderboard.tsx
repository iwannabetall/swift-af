import moment from 'moment';

function Leaderboard({ data } : { data : Leaderboard[] }) {
	
	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights'} as const

	const albumKeyLkup = { "Taylor Swift" : "Taylor_Swift", "Fearless" : "Fearless", "Speak Now" : "Speak_Now", 'Red' : 'Red', '1989' : '1989', 'reputation' : 'reputation', 'Lover' : 'Lover', 'folklore' : 'folklore', 'evermore' : 'evermore', 'Midnights' : 'Midnights'} as const

	return (
		<div className="mt-4 flex flex-col m-2 p-2 bold text-center justify-center">
			{data && <div className='flex flex-row flex-wrap items-center justify-center'>
				{data.map(x=> <div className={`leaderboardContainer ${x.game_mode == 'album' ? albumColorKey[albumKeyLkup[x.album_mode as keyof typeof albumKeyLkup]] : 'era-reputation '} text-center m-4 p-2 shadow-md rounded`}>
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
	)

}

export default Leaderboard