import title from '/title.svg'
import Nav from './Nav.tsx'
import Loader from './Loader.tsx'

function Layout({children, isLoading}: {children: React.ReactNode, isLoading: boolean}) {
 
	return(
		<>
		<Nav location={location}></Nav>
			{isLoading && <div>
				<div className=''>
					<img src={title} className='mx-auto mt-20 logo p-4 max-h-32' alt="Swift AF" />	
				</div>
				<Loader/></div>}
			
			{!isLoading && <div className='grid grid-cols-1 p-2 justify-items-center mt-20 lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2 justify-center'>
				
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />				
				</div>	
				{children}
			</div>}

		</>
	)
}

export default Layout
