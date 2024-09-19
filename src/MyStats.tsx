import { useState, useEffect } from 'react'
import axios from 'axios';
import * as d3 from 'd3';
import { useCookies } from 'react-cookie';
// import Loader from './Loader.tsx';
import * as TS from './Constants.tsx'
import { useNavigate } from 'react-router-dom';
import useScreenSize from './useScreenSize.tsx';
import { useGetUserStats } from './data/hooks.tsx';
import Layout from './Layout.tsx';

let userStats: GameResults[] = []

function MyStats() {

	const URL = TS.config.url
	const albumColorKey = TS.albumColorKey
	const albumColorKeyvLighter = TS.albumColorKeyvLighter
	const albumKeyLkup = TS.albumKeyLkup

	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [cookies] = useCookies(['sess']);
	const [brushRange, setBrushRange] = useState<BrushRange>({x0: undefined, y0: undefined, x1: undefined, y1: undefined})
	const navigate = useNavigate()
	const screenSize = useScreenSize()

	const gameSymbols = ['symbolCross']

	const margin = TS.margin
	const marginBottom = TS.marginBottom
	const marginTop = TS.marginTop
	const marginLeft = TS.marginLeft
	const marginRight = TS.marginRight

	// plot of avg accuracy vs speed with colors by album
		// repeat for their game type, size based off number of plays 
	// highest accuracy, fastest game thats at least their median accuracy - percentile vs overall by level 
	// 
	console.log('brushRange', brushRange)
	const userGameData = useGetUserStats(cookies.sess, brushRange)

	const statsByGame = userGameData.data?.statsByGame ? userGameData.data.statsByGame : []

	const statsByAlbum = userGameData.data?.albumStats ? userGameData.data.albumStats : []
	console.log('userGameData', userGameData.isFetching, userGameData.data)
	const swiftestLyrics = userGameData.data?.fastest ? userGameData.data.fastest : []
	// TODO how to redirect if page expired 
	
	useEffect(()=> {
		// scatter plot of accuracy vs date -- each circle color coded by album, squares for game mode - diff colors 
		d3.selectAll('.yourgames').remove()

		
		const h = screenSize.width > 420 ? 600 : 460
		const w = screenSize.width > 420 ? 600 : 420
		const fontSize = screenSize.width > 420 ? '20px' : '18px'
		const margin = 30
		const marginBottom = 45
		const marginTop = 36
		const marginLeft = 60
		const marginRight = 15
		
		// statsByGame is in d3 rollup form so need the d[1] -- but don't need it later bc we make an array of JS obj
		let xScale = d3.scaleUtc(d3.extent(statsByGame, d=> new Date(d.date)), [marginLeft, w - marginRight])

		
		let yScale = d3.scaleLinear().domain([Math.min(Math.max(...statsByGame.map(x=> x.accuracy)) + 5, 100), Math.max(0, Math.min(...statsByGame.map(x=> x.accuracy)) - 5)]).range([marginTop, h - marginBottom])


		let xInvScale = d3.scaleUtc().domain([marginLeft, w - marginRight]).range([Math.min(...statsByGame.map(x=> (new Date(x.date)).getTime())), Math.max(...statsByGame.map(x=> (new Date(x.date)).getTime()))])				
				
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

				console.log('selection', [x0, xInvScale(x0), x1, xInvScale(x1)], [x1,  yInvScale(y0), y0, yInvScale(y1), y1])					

				let selectedData = statsByGame?.filter(x=> (new Date(x.date)).getTime() >= xInvScale(x0) && (new Date(x.date)).getTime() <= xInvScale(x1) && x.accuracy <= yInvScale(y0) && x.accuracy >= yInvScale(y1))

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

		
		let gameModes = scatter.selectAll<SVGPathElement, GameResults>('path').data(byGameMode, function(d: GameResults) {
			return d.game_id
		})	

		gameModes.enter().append("path")
			.attr("d", d3.symbol(d3.symbolCross))
			.attr('transform', function(d) { return `translate(${xScale(new Date(d.date))}, ${yScale(d.accuracy)})`})

		let mygames = scatter.selectAll<SVGCircleElement, GameResults>('circle').data(byAlbumMode, function(d: GameResults) {
			return d.game_id
		})		
		
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
					.attr('y', startY)
					.attr('font-size', fontSize)
					.html(`${d.accuracy}% (${d.correct}/${d.total}) | Avg Time: ${d.time}s`)
	
					d3.select('.yourgames').append('text')
					.attr('class', 'hoverlabel')
					.attr('x', xPos)
					.attr('y', startY + 25)
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
						`<div>${d.accuracy}% (${d.correct}/${d.total}) | Avg Time: ${d.time}s</div>
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
				return xScale(new Date(d.date))
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

	}, [statsByGame])

	useEffect(()=> {
		// swiftest 10 lyrics 
		if (swiftestLyrics) {
			d3.selectAll('.top40Lyrics').remove()

			let top10Lyrics = d3.select('#swiftest10')
	
			var top10Lines = top10Lyrics.selectAll<SVGRectElement, GameResults>('rect').data(swiftestLyrics, function(d: GameResults) {
				return d.lyric_id
			})

			top10Lines.enter().append('rect')
				.attr('class', function (d: GameResults) { return `top40Lyrics ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})
				.attr('x', 20)			
				.attr('y', function(_, i: number) { 
					return i * 20 + 30})
				.style('width', 400)
				// .style('height', '100%')
				.style('height', function(d: GameResults){
					if (screenSize.width < 400) {
						if (d.lyric.length > 51){
							// need two rows for long lines, can't use height to 100% if want any transitions tho
							return '54px'  
						} else {
							return '30px'
						}
					} else {
						if (d.lyric.length > 53){
							// need two rows for long lines, can't use height to 100% if want any transitions tho
							return '54px'  
						} else {
							return '30px'
						}
					}
					
				})
				.style("overflow-x", "visible") // Allow text overflow			
				.text(function(d: GameResults) { return d.lyric })
			
		}
		

	}, [swiftestLyrics])

	return (
		<>
		<Layout isLoading={isLoading}>
		
			<div className='wrapper'>
				<h2>Your Swiftest Top 10</h2>
				<div id='swiftest10'></div>
			</div>

			<div className='wrapper'>
				<h2>View Your Games</h2>
				<div id='yourgames'></div>
			</div>

			
			{statsByAlbum && <div className='mb-4'>
				<table>
					<thead>
						<tr>
						<th>Album</th>
						<th>Total</th>
						<th>Time</th>
						</tr>
					</thead>
					<tbody>
						{statsByAlbum.map(x =><tr className={`text-center text-[#68416d] ${albumColorKey[x[0] as keyof typeof albumColorKey]}`}
						key={`${x[0]}`}
						>
							<td className="border p-1">{x[1].album}</td>
							<td className="border p-1">{x.accuracy}% ({x[1].correct}/{x[1].total})</td>
							<td className="border p-1">{x[1].time}</td>
						</tr>)}		
					</tbody>					

				</table>
			</div>}
		</Layout>
		</>
	)

}

export default MyStats