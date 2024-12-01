import { useState, useEffect } from 'react'
import * as d3 from 'd3';
import useScreenSize from '../useScreenSize.tsx'

const screenSize = useScreenSize()
const h = screenSize.width > 420 ? 600 : 460
const w = screenSize.width > 420 ? 600 : 420

function getScale(type: string, data: any, key: string) {
	// returns both inverted and normal 
	const margin = 30
	const marginBottom = 45
	const marginTop = 36
	const marginLeft = 60
	const marginRight = 15

	if (type == 'date'){

			let scale = d3.scaleUtc(d3.extent(data, d=> new Date(d[key])), [marginLeft, w - marginRight])
			let invScale = d3.scaleUtc().domain([marginLeft, w - marginRight]).range([Math.min(...data.map(x=> (new Date(x[key])).getTime())), Math.max(...data.map(x=> (new Date(x[key])).getTime()))])				

		return {scale: scale, invScale: invScale}
	} else {

		// linear 
		let scale = d3.scaleLinear().domain([Math.min(Math.max(...data.map(x=> x[key])) + 5, 100), Math.max(0, Math.min(...data.map(x=> x[key])) - 5)]).range([marginTop, h - marginBottom])

		let invScale = d3.scaleLinear().domain([marginTop, h - marginBottom]).range([Math.max(...data.map(x=> x[key])), Math.min(...data.map(x=> x[key]))])

		return {scale: scale, invScale: invScale}
		
	}
		
}

// reuseable scatterplot with zoomable brush 
function Scatterplot (className: string, data: any, vizDiv: string, xType: string, yType: string, xKey: string, yKey: string, updateBrush: function) {
	// vizDiv = name of div that we're appending to -- will also double as the class name of objects we're appending 
	// xKey, yKey are the accessors in the data for the scale ie what are we scaling on 
	// need to pass in an object of the data type 

	
	const fontSize = screenSize.width > 420 ? '20px' : '18px'
	const margin = 30
	const marginBottom = 45
	const marginTop = 36
	const marginLeft = 60
	const marginRight = 15

	const xScales = getScale(xType, data, xKey)
	const yScales = getScale(yType, data, yKey)

	const xScale = xScales.scale
	const xInvScale = xScales.invScale

	const yScale = yScales.scale
	const yInvScale = yScales.invScale
	

	let scatter = d3.select(`#${vizDiv}`).append('svg')
	.attr('class', vizDiv)
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

			let selectedData = data?.filter(d=> d[xKey] >= xInvScale(x0) && d[xKey] <= xInvScale(x1) && d[yKey] <= yInvScale(y0) && d[yKey] >= yInvScale(y1))

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

	let albums = scatter.selectAll<SVGCircleElement, AggGameStats>('circle').data(statsByAlbum, function(d: AggGameStats) {
		return d.album_key
	})		

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
				.attr('y', startY)
				.attr('font-size', fontSize)
				.html(`${d.accuracy}% (${d.correct}/${d.total}) | Avg Time: ${d.avg_time?.toFixed(1)}s`)

				d3.select('.byalbum').append('text')
				.attr('class', 'hoverlabel')
				.attr('x', xPos)
				.attr('y', startY + 25)
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
					`<div>${d.accuracy}% (${d.correct}/${d.total}) | Avg Time: ${d.avg_time?.toFixed(1)}s</div>
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
		.attr('r', d=> rScale(d.total))				
		.attr('cy', function(d){					
			return yScale(d.accuracy)
		})
		.attr('cx', function(d){					
			return xScale(d.avg_time || 0)
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
			.text('Game Date'))
		
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
}

export default Scatterplot