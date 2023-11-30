function Scoreboard({ data } : { data : Scoreboard[] }) {
	
	return (
		<div>
			{data.length > 0 && <table className='mb-4'>
				<thead>
					<tr>
					<th>Player</th>
					<th>Speed (s)</th>
					<th>Accuracy</th>
					</tr>
				</thead>
				<tbody>
					{data.map(x =><tr className={'text-center'}>
						<td className="border p-1">{x.player_name}</td>
						<td className="border p-1">{x.time.toFixed(2)}s</td>
						<td className="border p-1">{x.correct}/{x.total} ({x.accuracy.toFixed(0)}%)</td>
					</tr>)}		
				</tbody>
			</table>}
		</div>
	)

}

export default Scoreboard