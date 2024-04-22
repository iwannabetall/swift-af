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


function SignUpPage() {

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
						navigate('/hi-its-me')	
						// setAlreadyExists(true)
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


	return (
		<>
		<Layout isLoading={false}>
			
			<div><h2>Welcome to Your New Account, it's been waiting for you</h2>			
			</div>
			
			<div className='signup flex flex-col container bold text-center justify-center items-center'>				
				<p>{loginMessage}</p>
				<div>
					<form className="signup era-1989 cursor-pointer shadow-md rounded px-8 pt-6 pb-6 mb-4 flex items-center justify-center flex-col text-center" onSubmit={(e: FormEvent<HTMLFormElement>) => submitUserName(e)}>
						<label htmlFor='username'>Username			
							<input className="input-form shadow cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" type='text' 
							id='username'
							value={playerName} 
							placeholder='20 chars max'
							maxLength={20}
							onChange={e => setPlayerName(e.target.value)}>
							</input>				
						</label>
						<label htmlFor='email'>Email
						<input className="input-form shadow cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" type='email' 
							id='email'
							value={userEmail} 
							placeholder='Email'
							maxLength={120}
							onChange={e => {
								if (loginMessage.length > 0) {
									setLoginMessage('')
								}
								setUserEmail(e.target.value)}}>
							</input>					
						</label>
						<label htmlFor='password'>Password
							<input className="input-form shadow cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" type='password' 
							id='password'
							value={password} 
							placeholder='Min 8 chars'
							maxLength={20}
							onChange={e => {
								if (loginMessage.length > 0) {
									setLoginMessage('')
								}
								setPassword(e.target.value)}}>
							</input>
						</label>
						<label htmlFor='password2'>Retype Password
							<input className="input-form shadow cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" type='password' 
							id='password2'
							value={passwordMatch} 
							placeholder='Retype Password'
							maxLength={20}
							onChange={e => setPasswordMatch(e.target.value)}>
							</input>
						</label>
						{passwordMatch.length > 0 && password != passwordMatch && <p>Passwords do not match</p>}
						{<button className={`${password == passwordMatch && password.length > 7 ? '' : 'faded'} era-midnights mt-4 cursor-pointer`}>Say You'll Remember Me</button>}
					</form>
					<p className='text-xs text-center'>Your info will not be shared with anybody because that's sketch and I can't imagine why I'd email you. Questions or concerns? Reach out: <a>sayhello@swift-af.com</a></p>
				</div>
				
			</div>
		</Layout>
		</>
	)

}

export default SignUpPage