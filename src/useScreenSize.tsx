import {useState, useEffect} from 'react';

function useScreenSize(): {width: number, height: number} {
	const [screenSize, setScreenSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight
	})

	function handleResize() {
		setScreenSize({
			width: window.innerWidth,
			height: window.innerHeight
		})
	}

	useEffect(() => {
		window.addEventListener('resize', handleResize)

		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	return screenSize

}

export default useScreenSize