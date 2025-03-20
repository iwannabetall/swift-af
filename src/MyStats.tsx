import { useState, useEffect } from 'react'
import * as d3 from 'd3';
import { useCookies } from 'react-cookie';
// import Loader from './Loader.tsx';
import * as TS from './Constants.tsx'
import { useNavigate } from 'react-router-dom';
import useScreenSize from './useScreenSize.tsx';
import { useGetUserStats } from './data/hooks.tsx';
import Layout from './Layout.tsx';
import SortableTable from './components/SortableTable.tsx';
import moment from 'moment';
import { AlbumStatsTable } from './components/AlbumStatsTable.tsx'


// FORMAT INTO ORGINAL
var pr = new Intl.PluralRules('en-US', { type: 'ordinal' });

const suffixes = new Map([
  ['one',   'st'],
  ['two',   'nd'],
  ['few',   'rd'],
  ['other', 'th'],
]);

const formatOrdinals = (n) => {
  const rule = pr.select(n);
  const suffix = suffixes.get(rule);
  return `${n}${suffix}`;
};

function MyStats() {

	const URL = TS.config.url
	const albumColorKey = TS.albumColorKey
	const albumColorKeyvLighter = TS.albumColorKeyvLighter
	const albumKeyLkup = TS.albumKeyLkup
	const keyToAlbumNameLkup = TS.keyToAlbumNameLkup

	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [cookies] = useCookies(['sess']);
	const [brushRange, setBrushRange] = useState<BrushRange>({x0: undefined, y0: undefined, x1: undefined, y1: undefined})
	const [brushRange_ByAlbum, setBrushRangeByAlbum] = useState<BrushRange>({x0: undefined, y0: undefined, x1: undefined, y1: undefined})
	const [sortBy, setSortBy] = useState<string>('accuracy')
	const [sortDir, setSortDir] = useState<boolean>(true)  // true = best to worst
	const [compareCorrect, setCompareCorrect] = useState<boolean>(true) // compare correct vs incorrect

	const [displayTable, setDisplayTable] = useState<string>('album')
	const [gameType, setGameType] = useState<string>('eras')
	const navigate = useNavigate()
	const screenSize = useScreenSize()

	const gameSymbols = ['symbolCross']

	const margin = TS.margin
	const marginBottom = TS.marginBottom
	const marginTop = TS.marginTop
	const marginLeft = TS.marginLeft
	const marginRight = TS.marginRight

	const h = screenSize.width > 420 ? 600 : screenSize.width > 375 ? 460 : 360
	const w = screenSize.width > 420 ? 600 : screenSize.width > 375 ? 420 : 360
	const fontSize = screenSize.width > 420 ? '20px' : '18px'

	

	// plot of avg accuracy vs speed with colors by album
		// repeat for their game type, size based off number of plays 
	// highest accuracy, fastest game thats at least their median accuracy - percentile vs overall by level 
	// 
	const userGameData = useGetUserStats(cookies.sess, brushRange, brushRange_ByAlbum)

	const userGameDataFull = userGameData.data?.db ? userGameData.data.db : []

	const statsByGame = userGameData.data?.statsByGame ? userGameData.data.statsByGame : []

	const statsByAlbum = userGameData.data?.albumStats ? userGameData.data.albumStats : []
	console.log('userGameData', userGameData.isFetching, userGameData.data)
	const swiftestLyrics = userGameData.data?.fastest ? userGameData.data.fastest : []
	
	const songStats = userGameData.data?.songStats ?  userGameData.data?.songStats : []

	// TODO how to redirect if page expired 
	const dataByAlbum = {}  // keys are album_key and value is array of values 
	const quantilesByAlbums: Quantiles[] = [] 
 

	const gameHeaders = [{
			Header: '',
			id:'games',
			columns: [
		{
			Header: 'Date',
			accessor: d => moment(d.date).format('MMM D, YYYY'),
		},
		{
			Header: 'Game Type',
			id:'game_mode',       
			accessor: d=> d.album_mode == 'THE TORTURED POETS DEPARTMENT' ? 'TTPD' : d.game_mode == 'album' ? d.album_mode : d.game_mode 
		},				
		{
			Header: 'Accuracy',
			id:'accuracy',
			accessor: d=> `${d.accuracy}% (${d.correct}/${d.total})`,			 
		},		
		{
			Header: 'Speed (s)',
			id: 'speed',
			accessor: d=> parseFloat(d.avg_time),
		}
	]
}]

	useEffect(()=> {
		// scatter plot of accuracy vs date -- each circle color coded by album, squares for game mode - diff colors 
		// TODO opacity to account for diff number of plays per game 
		d3.selectAll('.yourgames').remove()


		const minTimeBoundary = Math.min(...statsByGame.map(x=> parseFloat(x.avg_time))) 
		const maxTimeBoundary = Math.max(...statsByGame.map(x=> parseFloat(x.avg_time)))

		let xScale = d3.scaleLinear().domain([minTimeBoundary, maxTimeBoundary]).range([marginLeft, w - marginRight])

		// statsByGame is in d3 rollup form so need the d[1] -- but don't need it later bc we make an array of JS obj
		// let xScale = d3.scaleUtc(d3.extent(statsByGame, d=> new Date(d.date as string)) as [Date, Date], [marginLeft, w - marginRight])

		
		let yScale = d3.scaleLinear().domain([Math.min(Math.max(...statsByGame.map(x=> x.accuracy)) + 5, 100), Math.max(0, Math.min(...statsByGame.map(x=> x.accuracy)) - 5)]).range([marginTop, h - marginBottom])


		let xInvScale = d3.scaleUtc().domain([marginLeft, w - marginRight]).range([Math.min(...statsByGame.map(x=> (new Date(x.date as string)).getTime())), Math.max(...statsByGame.map(x=> (new Date(x.date as string)).getTime()))])				
				
		let yInvScale = d3.scaleLinear().domain([marginTop, h - marginBottom]).range([Math.max(...statsByGame.map(x=> x.accuracy)), Math.min(...statsByGame.map(x=> x.accuracy))])


		let byAlbumMode = statsByGame.filter(x=> x.game_mode == 'album')
		let byGameMode = statsByGame.filter(x=> x.game_mode != 'album')

		// ['classics version', "Tortured Classics", "Taylor's Version", "The Eras", 'cult version']
		
		// const symbolType = d3.scaleOrdinal(d3.symbolsStroke);
		// console.log('shapes', symbolType)

		console.log('byGameMode', byGameMode)
	
	
		let scatter = d3.select("#yourgames").append('svg')
			.attr('class', 'yourgames')
			.attr('height', h)
			.attr('width', w)
			.attr("viewBox", `0 0 ${h} ${w}`)	
		
		const brush = d3.brush().on("end", ({selection}) => {

			// setScatterHighlight('')
			d3.selectAll('.hoverlabel').remove()
			d3.selectAll('.tooltip').remove()
			
			if (selection) {
				const [[x0, y0], [x1, y1]] = selection;			

				// let selectedData = statsByGame?.filter(x=> (new Date(x.date as string)).getTime() >= xInvScale(x0) && (new Date(x.date as string)).getTime() <= xInvScale(x1) && x.accuracy <= yInvScale(y0) && x.accuracy >= yInvScale(y1))

				let selectedData = statsByGame?.filter(x=> parseFloat(x.avg_time) >= xInvScale(x0) && parseFloat(x.avg_time) <= xInvScale(x1) && x.accuracy <= yInvScale(y0) && x.accuracy >= yInvScale(y1))
				console.log('burhs', selectedData)

				if (selectedData.length > 0) {

					// // y1 is further up (larger than y0)
					setBrushRange({x0: x0, y0: y0, x1: x1, y1: y1})

				}
									
			}
		})		
		.extent([[marginLeft-10,0], [w, h-marginBottom + 10]])  // overlay sizing

		//!!!! must create brush before appending bc it overlays a rect that will block mouseover events
		scatter.append('g').attr('class', 'brush')
			.call(brush)
			.on("dblclick", function() {
				setBrushRange({x0: undefined, y0: undefined, x1: undefined, y1: undefined})
			})		

		// REMOVED FROM DATA FUNCTION, function(d: AggGameStats) {
		// 	return d.game_id
		// }
		let gameModes = scatter.selectAll<SVGPathElement, AggGameStats>('path').data(byGameMode)	

		gameModes.enter().append("path")
			.attr("d", d3.symbol(d3.symbolCross))
			.attr('transform', function(d) { 
				// return `translate(${xScale(new Date(d.date as string))}, ${yScale(d.accuracy)})`
					return `translate(${xScale(parseFloat(d.avg_time) )}, ${yScale(d.accuracy)})`
			})
			.on('mouseover', function(event, d) {

				// console.log(d.album)
				const startY = -40
				const xPos = screenSize.width < 420 ? 10 : 60		
				
				if (screenSize.width < 600) {
					// if mobile, tool tip goes off page
					d3.select('.yourgames').append('text')
					.attr('class', 'hoverlabel')
					.attr('x', xPos)
					.attr('y', startY + 20)
					.attr('font-size', fontSize)
					.html(`${d.accuracy}% (${d.correct}/${d.total}) | Avg Time: ${parseFloat(d.avg_time)}s`)
	
					d3.select('.yourgames').append('text')
					.attr('class', 'hoverlabel')
					.attr('x', xPos)
					.attr('y', startY + 40)
					.attr('font-size', fontSize)
					.text(`${d.game_mode}`)
						
				} else {

					d3.selectAll('.tooltip').remove()
					
					var	tooltip = d3
						.select('body')
						.append('g')
							.attr('class', 'tooltip')
						.append('div')
						.style('width', '320px')
						.attr('class', 'd3-tooltip')
						.style('position', 'absolute')
						.style('z-index', '10')
						// .style('visibility', 'hidden')
						.style('padding', '10px')
						.style('background', 'rgba(0,0,0,0.6)')
						.style('border-radius', '4px')
						.style('color', '#fff')

				tooltip
					.style('top', `${event.pageY + 10}px`)
					.style('left', `${event.pageX + 10}px`)
					.html(
						`<div>${d.accuracy}% (${d.correct}/${d.total}) | Avg Time: ${parseFloat(d.avg_time)}s</div>
						<div>${d.game_mode}</div>`
					)
					// .style('visibility', 'visible');
 
				}			
							
			})
			.on('mouseout', function(){
				d3.selectAll('.hoverlabel').remove()
				d3.selectAll('.tooltip').remove()
				// setScatterHighlight('')
			})		

		// TODO REMOVED FROM DATA FUNCTION - DOES IT MATTER? 
		// , function(d: AggGameStats) {
		// 	return d.game_id
		// }
		let mygames = scatter.selectAll<SVGCircleElement, AggGameStats>('circle').data(byAlbumMode)		
		
		// cant seem to get transitions to work with mouseover with joins...so using enter.append			
		mygames.enter().append('circle')
			.attr('class', function(d) {
				 return `${d.album_mode ? albumColorKeyvLighter[albumKeyLkup[d.album_mode as keyof typeof albumKeyLkup] as keyof typeof albumColorKeyvLighter] : 'era-taylor-swift'}`
				
			})									
			.on('mouseover', function(event, d) {

				// console.log(d.album)
				const startY = -40
				const xPos = screenSize.width < 420 ? 10 : 60		
				
				if (screenSize.width < 600) {
					// if mobile, tool tip goes off page
					d3.select('.yourgames').append('text')
					.attr('class', 'hoverlabel')
					.attr('x', xPos)
					.attr('y', startY + 20)
					.attr('font-size', fontSize)
					.html(`${d.accuracy}% (${d.correct}/${d.total}) | Avg Time: ${parseFloat(d.avg_time)}s`)
	
					d3.select('.yourgames').append('text')
					.attr('class', 'hoverlabel')
					.attr('x', xPos)
					.attr('y', startY + 40)
					.attr('font-size', fontSize)
					.text(`${d.album_mode}`)
						
				} else {

					d3.selectAll('.tooltip').remove()
					
					var	tooltip = d3
						.select('body')
						.append('g')
							.attr('class', 'tooltip')
						.append('div')
						.style('width', '320px')
						.attr('class', 'd3-tooltip')
						.style('position', 'absolute')
						.style('z-index', '10')
						// .style('visibility', 'hidden')
						.style('padding', '10px')
						.style('background', 'rgba(0,0,0,0.6)')
						.style('border-radius', '4px')
						.style('color', '#fff')

				tooltip
					.style('top', `${event.pageY + 10}px`)
					.style('left', `${event.pageX + 10}px`)
					.html(
						`<div>${d.accuracy}% (${d.correct}/${d.total}) | Avg Time: ${parseFloat(d.avg_time)}s</div>
						<div>${d.album_mode}</div>`
					)
					// .style('visibility', 'visible');
 
				}			
							
			})		
			.on('mouseout', function(){
				d3.selectAll('.hoverlabel').remove()
				d3.selectAll('.tooltip').remove()
				// setScatterHighlight('')
			})				
			// .attr('cx', 0)  // make bounce look like spray bottle 
			// .attr('cy', h)
			// .transition(t)
			.attr('r', '6')				
			.attr('cy', function(d){					
				return yScale(d.accuracy)
			})
			.attr('cx', function(d){					
				return xScale(parseFloat(d.avg_time))
				// return xScale(new Date(d.date as string))
			})
		
		d3.select('.yourgames').append('g')
			.attr('class', 'date-xaxis')
			.attr('transform', `translate(0, ${h - margin})`)
			// .call(xAxisGen, xScale)				
			.call(d3.axisBottom(xScale))
			.call(g=> g.append('text')
				.attr('y', 27)
				.attr('x', w/2)
				.attr('font-size', '12px')
				.style('fill', 'black')  // fill defaults to none w/axis generator 
				.text('Game Date'))
			
		//y axis 
		d3.select('.yourgames').append('g')
			.attr('class', 'accuracy-yaxis')
			.attr('transform', `translate(${1.7*margin}, 0)`)			
			.call(d3.axisLeft(yScale))
			.call(g=> g
				.append('text')
				.attr('x', -26)
				.attr('y', 25)
				.attr("text-anchor", "middle")
				.attr('font-size', '12px')
				.style('fill', 'black')
				.text('Accuracy')			
			)

	}, [statsByGame, gameType])

	
	useEffect(()=> {
		// scatter plot of accuracy vs speed by album -- larger circles = more plays, --separate by vault songs, add cult 

		d3.selectAll('.byalbum').remove()

		const minTimeBoundary = Math.min(...statsByAlbum.map(x=> parseFloat(x.avg_time))) 
		const maxTimeBoundary = Math.max(...statsByAlbum.map(x=> parseFloat(x.avg_time)))

		let xScale = d3.scaleLinear().domain([minTimeBoundary, maxTimeBoundary]).range([marginLeft, w - marginRight])

		let yScale = d3.scaleLinear().domain([Math.min(Math.max(...statsByAlbum.map(x=> x.accuracy)) + 5, 100), Math.max(0, Math.min(...statsByAlbum.map(x=> x.accuracy)) - 5)]).range([marginTop, h - marginBottom])

		const rScale =  d3.scaleLinear().domain([Math.min(...statsByAlbum.map(x=> x.total as number)), Math.max(...statsByAlbum.map(x=> x.total as number))]).range([6, 20])

		let xInvScale = d3.scaleUtc().domain([marginLeft, w - marginRight]).range([Math.min(...statsByAlbum.map(x=> parseFloat(x.avg_time))), Math.max(...statsByAlbum.map(x=> parseFloat(x.avg_time)))])				
				
		let yInvScale = d3.scaleLinear().domain([marginTop, h - marginBottom]).range([Math.max(...statsByAlbum.map(x=> x.accuracy)), Math.min(...statsByAlbum.map(x=> x.accuracy))])

		// ['classics version', "Tortured Classics", "Taylor's Version", "The Eras", 'cult version']

	
		let scatter = d3.select("#byalbum").append('svg')
			.attr('class', 'byalbum')
			.attr('height', h)
			.attr('width', w)
			.attr("viewBox", `0 0 ${h} ${w}`)	
		
		const brush = d3.brush().on("end", ({selection}) => {

			// setScatterHighlight('')
			d3.selectAll('.hoverlabel').remove()
			d3.selectAll('.tooltip').remove()
			
			if (selection) {
				const [[x0, y0], [x1, y1]] = selection;			

				console.log('selection', [x0, xInvScale(x0), x1, xInvScale(x1)], [x1,  yInvScale(y0), y0, yInvScale(y1), y1])					

				let selectedData = statsByGame?.filter(x=> parseFloat(x.avg_time) >= xInvScale(x0) && parseFloat(x.avg_time) <= xInvScale(x1) && x.accuracy <= yInvScale(y0) && x.accuracy >= yInvScale(y1))

				if (selectedData.length > 0) {
					// // y1 is further up (larger than y0)
					setBrushRangeByAlbum({x0: x0, y0: y0, x1: x1, y1: y1})

				}
									
			}
		})		
		.extent([[marginLeft-10,0], [w, h-marginBottom + 10]])  // overlay sizing

		//!!!! must create brush before appending bc it overlays a rect that will block mouseover events
		scatter.append('g').attr('class', 'brush')
			.call(brush)
			.on("dblclick", function() {
				setBrushRangeByAlbum({x0: undefined, y0: undefined, x1: undefined, y1: undefined})
			})		


		// TODO - REMOVED from data function function(d: AggGameStats ) {
		// 	return d?.album_key
		// }
		let albums = scatter.selectAll<SVGCircleElement, AggGameStats>('circle').data(statsByAlbum)		
		
		// cant seem to get transitions to work with mouseover with joins...so using enter.append			
		albums.enter().append('circle')
			.attr('class', function(d) {
				 return `${albumColorKey[d.album_key as keyof typeof albumColorKey]}`
			})									
			.on('mouseover', function(event, d) {

				// console.log(d.album)
				const startY = -40
				const xPos = screenSize.width < 420 ? 10 : 60		
				
				if (screenSize.width < 600) {
					// if mobile, tool tip goes off page
					d3.select('.byalbum').append('text')
					.attr('class', 'hoverlabel')
					.attr('x', xPos)
					.attr('y', startY + 20)
					.attr('font-size', fontSize)
					.html(`${d.accuracy}% (${d.correct}/${d.total}) | Avg Time: ${d.avg_time}s`)
	
					d3.select('.byalbum').append('text')
					.attr('class', 'hoverlabel')
					.attr('x', xPos)
					.attr('y', startY + 40)
					.attr('font-size', fontSize)
					.text(`${d.album}`)
						
				} else {

					d3.selectAll('.tooltip').remove()
					
					var	tooltip = d3
						.select('body')
						.append('g')
							.attr('class', 'tooltip')
						.append('div')
						.style('width', '320px')
						.attr('class', 'd3-tooltip')
						.style('position', 'absolute')
						.style('z-index', '10')
						// .style('visibility', 'hidden')
						.style('padding', '10px')
						.style('background', 'rgba(0,0,0,0.6)')
						.style('border-radius', '4px')
						.style('color', '#fff')

				tooltip
					.style('top', `${event.pageY + 10}px`)
					.style('left', `${event.pageX + 10}px`)
					.html(
						`<div>${d.accuracy}% (${d.correct}/${d.total}) | Avg Time: ${d.avg_time}s</div>
						<div>${d.album}</div>`
					)
					// .style('visibility', 'visible');
 
				}			
							
			})		
			.on('mouseout', function(){
				d3.selectAll('.hoverlabel').remove()
				d3.selectAll('.tooltip').remove()
				// setScatterHighlight('')
			})				
			// .attr('cx', 0)  // make bounce look like spray bottle 
			// .attr('cy', h)
			// .transition(t)
			.attr('r', d=> rScale(d.total as number))				
			.attr('cy', function(d){					
				return yScale(d.accuracy)
			})
			.attr('cx', function(d){					
				return xScale(parseFloat(d.avg_time) || 0)
			})
		
		d3.select('.byalbum').append('g')
			.attr('class', 'date-xaxis')
			.attr('transform', `translate(0, ${h - margin})`)
			// .call(xAxisGen, xScale)				
			.call(d3.axisBottom(xScale))
			.call(g=> g.append('text')
				.attr('y', 27)
				.attr('x', w/2)
				.attr('font-size', '12px')
				.style('fill', 'black')  // fill defaults to none w/axis generator 
				.text('Avg Speed (s)'))
			
		//y axis 
		d3.select('.byalbum').append('g')
			.attr('class', 'accuracy-yaxis')
			.attr('transform', `translate(${1.7*margin}, 0)`)			
			.call(d3.axisLeft(yScale))
			.call(g=> g
				.append('text')
				.attr('x', -26)
				.attr('y', 25)
				.attr("text-anchor", "middle")
				.attr('font-size', '12px')
				.style('fill', 'black')
				.text('Accuracy')			
			)

	}, [statsByAlbum])
 
	const lyricHeaders = [
		{
			Header: '',
			id:'toplyrics',
			columns: [
		{
			Header: 'Lyric',
			id: 'lyric', 
			albumKey: d=> d.album_key,
		className: 'data',
		accessor: d=> d.lyric,
		},
		{
			Header: 'Speed',
			id: 'speed', 
		className: 'data',
		accessor: d=> `${(d.time).toFixed(2)}s`,
		},
		{
			Header: 'Pctl',
			id: 'pctl', 
		className: 'data',
		accessor: d=> formatOrdinals(getPercentile(d.time)),
		}]}]

		const songHeaders = [
			{
				Header: '',
				id:'topsongs',
				columns: [
			{
				Header: 'Song',
				id: 'song', 
				albumKey: d=> d.album_key,
			className: 'data',
			accessor: d=> d.song,
			},
			{
				Header: 'Accuracy',
				id: 'accuracy', 
			className: 'data',
			accessor: d=> `${(100*d.accuracy).toFixed(0)}% (${d.correct}/${d.total})`,
			},
			{
				Header: 'Avg (Pctl)',
				id: 'pctl', 
			className: 'data',
			accessor: d=> `${d.avg_time.toFixed(2)}s (${formatOrdinals(getPercentile(d.avg_time))})`,
			}]}]
 
	return (
		<>
		<Layout isLoading={isLoading}>
			{swiftestLyrics && <div className='wrapper'>
				<h2>Your Swiftest...</h2>
				<div className='flex flex-col container bold text-center justify-center items-center'>
					<div className='flex flex-row container bold text-center justify-center'>
						<div className={`${displayTable == 'album' ? 'era-reputation' : 'faded'} inline p-2 w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
							onClick={() => setDisplayTable('album')}>Album</div>
						<div className={`${displayTable == 'song' ? 'era-reputation' : 'faded'} inline p-2 w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
							onClick={() => setDisplayTable('song')}>Song</div>
							<div className={`${displayTable == 'lyric' ? 'era-reputation' : 'faded'} inline p-2 w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
							onClick={() => setDisplayTable('lyric')}>Lyric</div>
					</div>
					{displayTable === 'album' && <AlbumStatsTable data={statsByAlbum}/>}
					{displayTable === 'lyric' && <SortableTable 
					data = {swiftestLyrics}
					columns={lyricHeaders}
					/>}
					{displayTable === 'song' && songStats.filter((x: any)=> x.total > 5 && x.accuracy > 0.5).slice(0,10).length > 0 && <SortableTable 
					data = {songStats.filter((x: any)=> x.total > 5 && x.accuracy > 0.5).slice(0,10)}
					columns={songHeaders}
					/>}
					
				</div>			
 
			</div>}
 

			<div className='spotifyscatter-wrapper'>
				<h2>Accuracy vs. Speed</h2>
				<div id='byalbum'></div>
				<h2 className='m-6'>View Your Games</h2>

				<div className='flex flex-col container bold text-center justify-center items-center'>
					<div className='flex flex-row container bold text-center justify-center'>
						<div className={`${gameType == 'eras' ? 'era-reputation' : 'faded'} inline p-2 w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
							onClick={() => setGameType('eras')}>Eras</div>
						<div className={`${gameType == 'album' ? 'era-reputation' : 'faded'} inline p-2 w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
							onClick={() => setGameType('album')}>Album Mode</div>
						 
					</div>
					<div className="tableContainer mt-4 max-h-96 overflow-auto">
						<SortableTable 
							data={gameType === 'eras' ? statsByGame.filter(x=> x.game_mode !== 'album') : statsByGame.filter(x=> x.game_mode === 'album')}
							columns={gameHeaders}
						/>
					</div>
					
					
				</div>			
				<h3 className='text-lg'>Select a game to view individual game results</h3>
				
				<div id='yourgames'></div>
				
			</div>

			 


		</Layout>
		</>
	)

}



function getPercentile(time) {
	// percentiles are on lyric level (not averaged or by game)
	// gets percentile for a given time 
	
	// 99th percentile: 1.122
	const quantiles = [1.122, 1.281, 1.374, 1.443, 1.504, 1.555, 1.604, 1.648, 1.688, 1.727, 1.764, 1.8, 1.836, 1.869, 1.903, 1.937, 1.97, 2.003, 2.034, 2.065, 2.097, 2.128, 2.159, 2.191, 2.223, 2.254, 2.285, 2.316, 2.348, 2.381, 2.414, 2.448, 2.483, 2.516, 2.55, 2.585, 2.62, 2.655, 2.691, 2.727, 2.765, 2.804, 2.841, 2.88, 2.921, 2.96, 3.003, 3.045, 3.087, 3.13, 3.177, 3.224, 3.274, 3.323, 3.372, 3.423, 3.475, 3.527, 3.582, 3.64, 3.698, 3.758, 3.818, 3.881, 3.947, 4.016, 4.087, 4.158, 4.231, 4.31, 4.391, 4.472, 4.558, 4.648, 4.741, 4.84, 4.942, 5.052, 5.168, 5.289, 5.415, 5.552, 5.694, 5.845, 6.006, 6.173, 6.364, 6.564, 6.789, 7.033, 7.292, 7.6, 7.9589, 8.369, 8.863, 9.5268, 10.426, 11.8054, 14.5825]

	// 0.152 - 99.9th percentile to  1.094 - 99.1th percentile
	const top99th = [0.152, 0.184, 0.214, 0.262, 0.45265, 0.89478, 1.013, 1.063, 1.094]

	if (time <= quantiles[0]) {
			// return 99th percentile 
		for (let i = 0; i < top99th.length; i++) {
			
			while (time > top99th[i]){
				i++
			}
			return 100 - i/10
		}
	} else {
		// not in top 1 percent 
		for (let i = 0; i < quantiles.length; i++) {
			
			while (time > quantiles[i]){
				i++
			}
			return 99 - i
		}

	}

}

export default MyStats