import React from 'react';
import { useTable, useSortBy } from 'react-table'

function SortableTable(props) {	
	// console.log(props)

	let data = props.data
	let columns = props.columns
	let rowClick = props.rowClick  // function that runs when row is clicked
	let rowClickId = props.rowClickId  // if you need to pass data back on row click
	let rowHover = props.rowHover
	let rowMouseOut = props.rowMouseOut
	let rowId = props.rowId   // if you need to pass data back on row hover
	let highlightId = props.highlightId  // name of dynamic state that you're highlighting the row if it matches

	let cellRef = props.cellRef ? props.cellRef : ''
	let cellMouseOver = props.cellMouseOver
	let cellMouseOut = props.cellMouseOut 

	let leftAlign = props.leftAlign // columns in table to left align while everything else is centered
	let leftBorder = props.leftBorder ? props.leftBorder : []  // adding a thick border to grouped tables 	
	let sortBy = props.sortBy ? props.sortBy.split('-')[0] : ''  // category to sort by 
	let sortDirection = props.sortBy ? props.sortBy.split('-')[1] : ''  // sort by direction 
	let setSortBy = props.setSortBy ? props.setSortBy : () => {}
	let stickyCol = props.stickyCol ? props.stickyCol : []
	let noSort = props.noSort ? props.noSort : []
	let stickyHeader = props.stickyHeader ? props.stickyHeader : ''	 // if true, header and 1st column are sticky
	let colSpan = props.colSpan ? props.colSpan : '' // anything after this column index will be collapsed if condition met 
  let altRowHighlight = props.altRowHighlight ? props.altRowHighlight : ''

	// conditionally render some columns.  column.hideHeader only works for the main top bar  
	let hideHeaders = props.hideHeaders ? props.hideHeaders : []

	// Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({
    columns,
    data,
  }, useSortBy)

  // console.log(headerGroups)
  // Render the UI for your table
  return (
    <table {...getTableProps()} className={altRowHighlight && stickyHeader ? 'stickyHeader altRowHighlighting' : stickyHeader ? 'stickyHeader' : altRowHighlight ? 'altRowHighlighting' : ''}>
      <thead>
        {headerGroups.map(headerGroup => ( 	
          <tr {...headerGroup.getHeaderGroupProps()}>						
            {headerGroup.headers.map((column, ind) => 
						{ 
							// have to have the literal word return here for this to work, why??  hideHeader is an attribute added to the headers prop
							return (column.hideHeader == true || hideHeaders.includes(column.Header)) ? null :(								
              <th {...column.getHeaderProps(column.getSortByToggleProps())} className={stickyCol.includes(column.Header) ? 'stickyCol' : leftBorder.includes(column.Header) ? 'leftborder' : ''} 
							onClick={() => 															 
								{
									if (!noSort.includes(column.Header)) {
										// if need to sort a subset of a larger array of data ie display 50 sorted rows of 450
										var direction
										column.toggleSortBy(!column.isSortedDesc);			

										if (sortDirection == 'asc' && column.id == sortBy) {
											// flip sort direction only if same catgory
											direction = 'desc'
										} else if (sortDirection == 'desc' && column.id == sortBy) {
											direction = 'asc'
										} else if (column.id != sortBy) {
											// if clicking diff cat, sort in desc
											direction = 'desc'
										}
										else {
											direction = 'asc'
										}
									
										setSortBy(`${column.id}-${direction}`);
									}
									
							}}>{column.render('Header')}<span>
                  {noSort.includes(column.Header) ? '' : column.isSorted || sortBy == column.id ? (column.isSortedDesc || sortDirection == 'desc' ? " 🔽" : !column.isSortedDesc || sortDirection == 'asc' ? " 🔼" : '') : ""}
                </span></th>
            )})}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, i) => {  	
					// console.log(row)
          prepareRow(row)
          return (
            <tr {...row.getRowProps()} 
							id={rowId ? `boxrow-${row.original[rowId]}` : `boxrow-${i}`}
							// if no highlight id provided, ignore and just make the table black and white 
							className={`${!highlightId ? 'data' : highlightId == row.original[rowId] ? 'highlightrow' : highlightId != row.original[rowId] && highlightId != '' ? 'faderow' : 'data'} ${!highlightId && row.original['season_type'] ? row.original['season_type'] == 'Playoffs' ? 'playoffs' : altRowHighlight ? 'altRowHighlighting' : '' : ''}`}
							onClick={rowClick && rowClickId ? (e) => rowClick(row.original[rowClickId]) : rowClick ? rowClick() : () => {} }							 
							onMouseEnter={rowHover ? (e) => rowHover(row.original[rowId]) : () => {}} 
							onMouseLeave={rowMouseOut ? (e) => rowMouseOut('') : () => {} }>
              {row.cells.map((cell,i) => {
                return hideHeaders.includes(cell.column.Header) ? null : <td {...cell.getCellProps([{
									style: cell.column.styleit }])} 
									className={stickyCol.includes(cell.column.Header) ? 'stickyCol' : (cell.column.isSorted || sortBy == cell.column.id) && leftBorder.includes(cell.column.Header) ? 'leftborder sortBy' : (cell.column.isSorted || sortBy == cell.column.id) ? 'sortBy' : cell.column.Header != leftAlign && !leftBorder.includes(cell.column.Header) ? 'data' : leftBorder.includes(cell.column.Header) ? 'leftborder' : cell.column.Header != leftAlign ? 'ldata' : 'data'}
									onMouseEnter={cellMouseOver ? (e) => {
											// console.log(row.original, `${cell.column.id}${cellRef}`)
										// run function if value exists, ie not all columns have pctls
										row.original[`${cell.column.id}${cellRef}`] ? cellMouseOver(row.original[`${cell.column.id}${cellRef}`], cell) : cellMouseOver('', cell)
									} : () => {}} 
									onMouseLeave={cellMouseOut ? (e) => cellMouseOut('') : () => {} }
								>{cell.render('Cell')}</td>
								})}
						</tr>
					)
        })}
      </tbody>
    </table>
  )
}

export default SortableTable