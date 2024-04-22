import { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import goback from '/goback.svg'
import { useNavigate } from 'react-router-dom';

import {
	RegExpMatcher,
	TextCensor,
	englishDataset,
	englishRecommendedTransformers,
} from 'obscenity';
import Layout from './Layout.tsx';
import { useCookies } from 'react-cookie';


function LoginPage() {

	const [playerName, setPlayerName] = useState<string>('')
	const [userEmail, setUserEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [passwordMatch, setPasswordMatch] = useState<string>('')

	const [alreadyExists, setAlreadyExists] = useState<boolean>(false)
	const [forgotPassword, setForgotPassword] = useState<boolean>(false)
	const [loginMessage, setLoginMessage] = useState<string>("\u00A0")
	const [loggedIn, setLoggedIn] = useState<boolean>(false)

	const [cookies, setCookie, removeCookie] = useCookies(['sess']);
	

	const navigate = useNavigate()


	function submitUserName(e: FormEvent<HTMLFormElement>){
		e.preventDefault()
		
		if (userEmail.length > 0 && password.length >= 8 && passwordMatch == password) {

			if (playerName == ''){
				setPlayerName('toolazytotype')
			} else {
				// censor for user names
				const censor = new TextCensor()
				const matcher = new RegExpMatcher({
					...englishDataset.build(),
					...englishRecommendedTransformers,
				});
				const matches = matcher.getAllMatches(playerName)
				
				const userName = censor.applyTo(playerName, matches)
				
				
				axios.post('http://localhost:3000/addNewUser', {
				// axios.post('https://swift-api.fly.dev/addNewUser', {			
				email: userEmail.trim(),
				password: password,
				username: userName,
				date: (new Date).toISOString(),
				
				})
				.then(function (response) {
					console.log('new user', response)
					if (response.data == 'account exists') {
						// show login 
						setAlreadyExists(true)
					} else if (response.data == 'sent') {						
						setLoginMessage('Please click the link in your email to confirm');
						setPassword('')
						setPasswordMatch('')						

					}					
				})
				.catch(function (error) {			
					console.log(error);
				});
	
			}
		} else {
			if (password != passwordMatch) {
				setLoginMessage('Passwords do not match.')
				setPassword('')
				setPasswordMatch('')
			}

			if (userEmail.length == 0) {
				setLoginMessage('Please fill in your email.')
			}

		}
				
	}

	function login(e: FormEvent<HTMLFormElement>){

		e.preventDefault()

		if (userEmail.length > 0 && password.length > 7) {
			axios.post('http://localhost:3000/login', {
				// axios.post('https://swift-api.fly.dev/login', {			
				email: userEmail.trim(),
				password: password,
			})
			.then(function(response) {

				console.log(response)
				// redirect back to home page if successfully login
				if (response.data == 'account dne'){
					// account does not exist 
					setLoginMessage('Sorry, could not find account.')
					setPassword('')
					setPasswordMatch('')

				} else if (response.data == 'wrong pw') {
					setLoginMessage('Incorrect Password. Please try again.')
					setPassword('')
					setPasswordMatch('')
				}

				else if (response.data.sessId) {
					console.log(response.data)
					setCookie('sess', response.data.sessId, {
						path: '/',
						expires: new Date(response.data.expiration),
						// secure: true
					})
					// redirect to home page + log in 
					navigate('/')
				}
	
			})
			.catch(function(error) {
				console.log(error)
			})
	
		} else {
			if (userEmail.length == 0) {
				setLoginMessage('Please fill in email.')
			}
			
			if (password.length < 8) {
				setLoginMessage('Password too short.')
			}
		}

			
	}

	function requestReset(e: FormEvent<HTMLFormElement>) {

		e.preventDefault()

		if (userEmail.length > 0) {

		}

	}

	return (
		<>
		<Layout isLoading={false}>
			
			<div>
				<h2>Welcome Back!</h2>				
			</div>
			
			<div className='signup flex flex-col container bold text-center justify-center items-center'>
				
				<p>{loginMessage}</p>	
			{/* login form */}
				{!forgotPassword && <form className="signup era-1989 cursor-pointer shadow-md rounded px-8 pt-6 pb-6 mb-4 flex items-center justify-center flex-col text-center" onSubmit={(e: FormEvent<HTMLFormElement>) => login(e)}>					
					<label htmlFor='email'>Email
					<input className="input-form shadow cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" type='email' 
						id='email'
						value={userEmail} 
						placeholder='Email'
						maxLength={120}
						onChange={e => setUserEmail(e.target.value)}>
						</input>					
					</label>
					<label htmlFor='password'>Password
						<input className="input-form shadow cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" type='password' 
						id='password'
						value={password} 
						placeholder='Min 8 chars'
						maxLength={20}
						onChange={e => setPassword(e.target.value)}>
						</input>
					</label>					
					{<button className={`${userEmail.length > 0 && password.length > 7 ? '' : 'faded'} era-midnights mt-4 cursor-pointer`}>I remember it all too well</button>}
					<p className='underline mt-5 mb-0' onClick={()=> setForgotPassword(true)}>Forgot password?</p>
				</form>}
				{alreadyExists && <div>
					An account already exists for this email.  Please login. <p className='underline' onClick={()=> setForgotPassword(true)}>Forgot password?</p>
					</div>}

		{/* reset/forgot password  */}
				{forgotPassword && 
				<div>	
					<div className='signup era-1989 cursor-pointer shadow-md rounded px-8 pt-6 pb-6 mb-4 '>					
					<div className='mb-5 w-20 text-left underline' onClick={()=> setForgotPassword(false)}>
						<img src={goback} className='back-arrow' alt="back" />Login </div>

						<form className="flex items-center justify-center flex-col text-center" onSubmit={(e: FormEvent<HTMLFormElement>) => requestReset(e)}>										
						<label htmlFor='email'>Email
						<input className="input-form shadow cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" type='email' 
							id='email'
							value={userEmail} 
							placeholder='Email'
							maxLength={120}
							onChange={e => setUserEmail(e.target.value)}>
							</input>					
						</label>	
						{<button className={`${userEmail.length > 0 ? '' : 'faded'} era-midnights mt-4 cursor-pointer`}>Reset Password</button>}
						</form>
					</div>			
				</div>}		
			</div>
		</Layout>
		</>
	)

}

export default LoginPage