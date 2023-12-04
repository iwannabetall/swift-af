import title from '/title.svg'
import Nav from './Nav.tsx'


function About() {

	return (
		<>
			<Nav location={location}></Nav>
			<div className='grid grid-cols-1 p-4 items-center mt-20 lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2'>
				
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />				
				</div>	

				<h2>What is your end game?</h2>
				<div><p>I'm in awe of my tswift fan friends and the r/TaylorSwift lyrical knowledge, and I'm a data nerd who currently has no job so why not build a game and measure it? </p>
				</div>		

				<h2>Can I help?</h2>
				<p>Are you asking cause you have design skills and have noticed that this site is lacking? Cause if so, then def reach out if you want a random side project lol</p>
				<p>Share with your friends!  We can find out which lines are most well known and which songs/albums have the most recognizable lyrics</p>
				<p>If you have a job you wanna offer or want to chip in a dollar to help buy me a taco/friendship bracelet/help pay for servers/hosting...not gonna stop ya lol</p>
				
				<h2>I have a game idea request/want to report a bug/have a pun to add to the snark/have a question for this page.</h2>
				<p>I am too lazy to create an email but message me on <a className='link' href='https://www.instagram.com/annazhaopian' target="_blank">instagram</a>. If you really want my attention, message me on <a className='link' target="_blank" href='https://account.venmo.com/u/Anna-Zhao-2'>venmo</a> or <a className='link' target="_blank" href='https://www.buymeacoffee.com/azhao'>buy me a <span className='line-through'>coffee</span> taco</a> lol</p>
				{/* https://www.buymeacoffee.com/azhao */}

				<h2></h2>		

			</div>
								
		</>
	)

}

export default About