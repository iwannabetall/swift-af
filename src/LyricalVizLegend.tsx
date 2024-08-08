
function LyricalVizLegend(props: {fighter: AlbumArt}){
	
	const accuracy_groups = [{key: 'gradeAplus', text: "A+"}, {key: 'gradeA', text: "A"}, {key: 'gradeB', text: " B "}, {key: 'gradeC', text: "C"}, {key: 'gradeD', text: "D"}, {key: 'gradeF', text: "F"}] as const

	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights', 'TTPD': 'era-ttpd'} as const

	return (
		<div>
			<h2>Are your favorite lines also the most recognized?</h2>
			<div className='flex flex-row flex-wrap justify-center'>		

				{accuracy_groups.map(x => 
					<div key={x.key} className={`legend ${x.key} 							
					${albumColorKey[props.fighter as keyof typeof albumColorKey]}-${x.key}`}
					>{x.text}</div>)}						
			</div>
		</div>
	)

}

export default LyricalVizLegend