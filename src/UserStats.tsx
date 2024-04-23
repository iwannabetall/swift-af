import { useState, useEffect } from 'react'
// import axios from 'axios';
// import * as d3 from 'd3';
// import { useCookies } from 'react-cookie';
// import Loader from './Loader.tsx';

import Layout from './Layout.tsx';

function UserStats() {

	const [isLoading, setIsLoading] = useState<boolean>(false)

	useEffect(()=> {
		
	}, [])
	
	return (
		<>
		<Layout isLoading={isLoading}>
			<h2>Coming Soon! Check back later for your stats.</h2>
		</Layout>
		</>
	)

}

export default UserStats