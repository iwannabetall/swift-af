import { useState, useEffect } from 'react'
import axios from 'axios';
import * as d3 from 'd3';
import { useCookies } from 'react-cookie';
// import Loader from './Loader.tsx';
import * as TS from './Constants.tsx'
import { useNavigate } from 'react-router-dom';
import useScreenSize from './useScreenSize.tsx';

import Layout from './Layout.tsx';

let userStats: GameResults[] = []

function MyStats() {

	const URL = TS.config.url
	const albumColorKey = TS.albumColorKey
	const albumColorKeyvLighter = TS.albumColorKeyvLighter
	const albumKeyLkup = TS.albumKeyLkup

	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [cookies] = useCookies(['sess']);
	const [swiftestLyrics, setSwiftestLyrics] = useState<GameResults>()
	const [statsByAlbum, setStatsByAlbum] = useState<AggGameStats[]>([])
	const [statsByDate, setStatsByDate] = useState<AggGameStats[]>([])
	const navigate = useNavigate()
	const screenSize = useScreenSize()

	const gameSymbols = ['symbolCross']

	useEffect(()=> {

		if (cookies.sess) {
			setIsLoading(true)
			axios.post(`${URL}/getUserStats`, { sess: cookies.sess })
			.then(function (response) {		

				userStats = response.data.userGameStats
				// stats by date 
				// statsByDate = d3.rollups(userStats, v=> {
				// 	return {
				// 		total: v.length,
				// 		correct: d3.sum(v, d=> d.correct),
				// 		accuracy: Math.round(100*(d3.sum(v, d=> d.correct)/v.length)),
				// 		time: v ? d3.mean(v, d=> d.time)?.toFixed(1): '-',
				// 		correct_time: v.filter(x=> x.correct == 1).length > 0 ? d3.mean(v.filter(x=> x.correct == 1), d=> d.time) : '-',
				// 		wrong_time: v.filter(x=> x.correct == 0).length > 0 ? d3.mean(v.filter(x=> x.correct == 0), d=> d.time) : '-'
				// 	}

				// }, d=> d.date)

				// stats by date 
				let albumStats = d3.rollups(userStats, v=> {
					// console.log('v', v)
					return {
						album: v[0].album,
						total: v.length,
						correct: d3.sum(v, d=> d.correct),
						accuracy: Math.round(100*(d3.sum(v, d=> d.correct)/v.length)),
						time: v ? d3.mean(v, d=> d.time)?.toFixed(1): '-',
						correct_time: v.filter(x=> x.correct == 1).length > 0 ? d3.mean(v.filter(x=> x.correct == 1), d=> d.time) : '-',
						wrong_time: v.filter(x=> x.correct == 0).length > 0 ? d3.mean(v.filter(x=> x.correct == 0), d=> d.time) : '-'

					}

				}, d=> d.album_key)
				setStatsByAlbum(albumStats)
				// stats by game 
				let statsByGame = d3.rollups(userStats, v=> {
					return {
						date: v[0].date,
						game_mode: v[0].game_mode,
						album_mode: v[0].album_mode,						
						total: v.length,
						correct: d3.sum(v, d=> d.correct),
						accuracy: Math.round(100*(d3.sum(v, d=> d.correct)/v.length)),
						time: v ? d3.mean(v, d=> d.time)?.toFixed(1): '-',
						correct_time: v.filter(x=> x.correct == 1).length > 0 ? d3.mean(v.filter(x=> x.correct == 1), d=> d.time) : '-',
						wrong_time: v.filter(x=> x.correct == 0).length > 0 ? d3.mean(v.filter(x=> x.correct == 0), d=> d.time) : '-'

					}

				}, d=> d.game_id)
				
				setStatsByDate(statsByGame)

				let fastest = userStats.filter(x=> x.correct == 1).sort((a,b) => a.time - b.time).slice(0,10)
				setSwiftestLyrics(fastest)

				

				console.log('statsByAlbum', albumStats)
				console.log(statsByDate, statsByAlbum, statsByGame, userStats)
				setIsLoading(false)
			})
			.catch(function (error) {				
				console.log(error);
			});	
		} else {
			// redirect if session has expired 
			navigate('/')
		}
		

	}, [])
	
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
		
		// statsByDate is in d3 rollup form so need the d[1] -- but don't need it later bc we make an array of JS obj
		let xScale = d3.scaleUtc(d3.extent(statsByDate, d=> new Date(d[1].date)), [marginLeft, w - marginRight])

		
		let yScale = d3.scaleLinear().domain([Math.min(Math.max(...statsByDate.map(x=> x[1].accuracy)) + 5, 100), Math.max(0, Math.min(...statsByDate.map(x=> x[1].accuracy)) - 5)]).range([marginTop, h - marginBottom])


		let xInvScale = d3.scaleLinear().domain([marginLeft, w - marginRight]).range([Math.min(...statsByDate.map(x=> x[1].accuracy)), Math.max(...statsByDate.map(x=> x[1].accuracy))])					
				
		let yInvScale = d3.scaleLinear().domain([marginTop, h - marginBottom]).range([Math.max(...statsByDate.map(x=> x[1].date)), Math.min(...statsByDate.map(x=> x[1].date))])


		let byAlbumMode = statsByDate.map(x=> x[1]).filter(x=> x.game_mode == 'album')
		let byGameMode = statsByDate.map(x=> x[1]).filter(x=> x.game_mode != 'album')

		// ['classics version', "Tortured Classics", "Taylor's Version", "The Eras", 'cult version']
		
		const symbolType = d3.scaleOrdinal(d3.symbolsStroke);
		console.log('shapes', symbolType)

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
				// console.log(selection)					

				let selectedData = statsByDate.filter(x=> x.date >= xInvScale(x0) && x.date <= xInvScale(x1) && x.accuracy <= yInvScale(y0) && x.accuracy >= yInvScale(y1))

				if (selectedData.length > 0) {
					// // y1 is further up (larger than y0)
					setStatsByDate(statsByDate.filter(x=> x.date >= xInvScale(x0) && x.date <= xInvScale(x1) && x.accuracy <= yInvScale(y0) && x.accuracy >= yInvScale(y1)))
				}
									
			}
		})		
		.extent([[marginLeft-10,0], [w, h-marginBottom + 10]])  // overlay sizing

		//!!!! must create brush before appending bc it overlays a rect that will block mouseover events
		scatter.append('g').attr('class', 'brush')
			.call(brush)
			.on("dblclick", function() {
				setStatsByDate(statsByDate)})		

		
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

	}, [statsByDate])

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
							<td className="border p-1">{x[1].accuracy}% ({x[1].correct}/{x[1].total})</td>
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