import * as TS from '../Constants.tsx'

export function AlbumStatsTable({data}) {
	const albumColorKey = TS.albumColorKey
	
	return (
		<div className='mb-4'>
			<h6>Your best song by album with your album summary</h6>
		<table>
			<thead>
				<tr>
				<th>Album - Song</th>
				<th>Total</th>
				<th>Avg Time</th>
				</tr>
			</thead>
			<tbody>
				{data.map(x =><>
				<tr className={`text-center text-[#68416d] ${albumColorKey[x.album_key as keyof typeof albumColorKey]}`}
				key={`${x.album_key}-albumstats`}
				>
					<td className="border p-1">{x.album}</td>
					<td className="border p-1">{x.accuracy}% ({x.correct}/{x.total})</td>
					<td className="border p-1">{x.correct_time != '-' ? parseFloat(x.correct_time as string).toFixed(2) : '-'} 
						{/* ({x.correct_time != '-' ? getPercentile(parseFloat(x.correct_time as string)) : '-'}) */}
						</td>
				 
				</tr>
				{x.topSong != '' && <tr className={`text-center text-[#68416d] ${albumColorKey[x.album_key as keyof typeof albumColorKey]}`}						
				>
					<td className="border p-1">{x.topSong}</td>
					<td className="border p-1">{x.topSongStats} </td>
					<td className="border p-1">{ typeof x.topSongSpeed == 'number' ? x.topSongSpeed.toFixed(2) : ''}s</td>
				 
				</tr>}
				</>
			)}		
			</tbody>					

		</table>
	</div>

	)

}