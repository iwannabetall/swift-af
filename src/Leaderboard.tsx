function Leaderboard({ data } : { data : Leaderboard[] }) {
	
	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights'} as const

	const albumKeyLkup = { "Taylor Swift" : "Taylor_Swift", "Fearless" : "Fearless", "Speak Now" : "Speak_Now", 'Red' : 'Red', '1989' : '1989', 'reputation' : 'reputation', 'Lover' : 'Lover', 'folklore' : 'folklore', 'evermore' : 'evermore', 'Midnights' : 'Midnights'} as const

	return (
		<div className="mt-4">
			{data.length > 0 && <table className='mb-4'>
				<thead>
					<tr>
					<th>Player</th>
					<th>Speed</th>
					<th>Accuracy</th>
					<th>Mode</th>
					</tr>
				</thead>
				<tbody>
					{data.map(x =><tr className={`${albumColorKey[albumKeyLkup[x.album_mode as keyof typeof albumKeyLkup]]} text-center`}>
						<td className="border p-1">{x.player_name}</td>
						<td className="border p-1">{x.time.toFixed(2)}s</td>
						<td className="border p-1">{x.correct}/{x.total} ({x.accuracy.toFixed(0)}%)</td>
						<td className="border p-1">{x.game_mode == 'album' ? x.album_mode : x.game_mode} </td>
					</tr>)}		
				</tbody>
			</table>}
		</div>
	)

}

export default Leaderboard