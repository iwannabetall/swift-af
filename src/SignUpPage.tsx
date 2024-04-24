import { useState, FormEvent } from 'react'
import axios from 'axios'
import goback from '/goback.svg'
import { useNavigate } from 'react-router-dom';

import Layout from './Layout.tsx';
import { useCookies } from 'react-cookie';
import * as TS from './Constants.tsx'


function SignUpPage() {

	const URL = TS.config.url

	// const [playerName, setPlayerName] = useState<string>('')
	const [userEmail, setUserEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [passwordMatch, setPasswordMatch] = useState<string>('')

	const [showSignUp, setShowSignUp] = useState<boolean>(true)
	const [alreadyExists, setAlreadyExists] = useState<boolean>(false)
	const [forgotPassword, setForgotPassword] = useState<boolean>(false)
	const [loginMessage, setLoginMessage] = useState<string>("\u00A0")

	const [cookies, setCookie] = useCookies(['sess']);
	const [userCookie, setUserCookie] = useCookies(['user_id']);
	
	const navigate = useNavigate()


	function createAccount(e: FormEvent<HTMLFormElement>){
		e.preventDefault()
		
		if (userEmail.length > 0 && password.length >= 8 && passwordMatch == password) {
	
			axios.post(`${URL}/addNewUser`, {				
				email: userEmail.trim(),
				password: password,
				date: (new Date).toISOString(),
				
			})
			.then(function (response) {
				// console.log('new user', response)
				if (response.data == 'account exists') {
					// show login 
					setShowSignUp(false)
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
			
			axios.post(`${URL}/login`, {		
				email: userEmail.trim(),
				password: password,
			})
			.then(function(response) {

				// console.log(response)
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
					// console.log(response.data)
					
					setCookie('sess', response.data.sessId, {
						path: '/',
						expires: new Date(response.data.expiration),
						// secure: true
					})

					setUserCookie('user_id', response.data.user_id, {
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
			
			axios.post(`${URL}/forgotPassword`, {			
				email: userEmail.trim(),
			})
			.then(function(response) {

				if (response.data == 'sent') {						
					setLoginMessage('Please click the link in your email to confirm');												

				}			
			})
			.catch(function(error) {
				console.log(error)
			})
		}

	}

	return (
		<>
		<Layout isLoading={false}>
			
			{showSignUp && <div><h2>Welcome to Your New Account, it's been waiting for you</h2>			
			</div>
			}
			{!showSignUp && <div>
				<h2>Welcome Back...Be Here</h2>
				</div>
			}
			<div className='signup flex flex-col container bold text-center justify-center items-center'>
				<div className='flex flex-row container bold text-center justify-center'>
					<div className={`${showSignUp ? 'era-midnights' : 'faded'} inline p-2 min-w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
					onClick={()=> {
						setShowSignUp(true);
						setForgotPassword(false)
						setLoginMessage('')
					}}
					>Sign up</div>
					<div  className={`${!showSignUp ? 'era-midnights' : 'faded'} inline p-2 min-w-[120px] inline-flex justify-center text-l font-bold shadow cursor-pointer border w-full leading-tight focus:outline-none focus:shadow-outline text-center`}
					onClick={()=> {
						setShowSignUp(false);
						setForgotPassword(false)
						setLoginMessage('')
					}}
					>Login</div>
				</div>	
				<p>{loginMessage}</p>
				{showSignUp && <div>
					<form className="signup era-1989 cursor-pointer shadow-md rounded px-8 pt-6 pb-6 mb-4 flex items-center justify-center flex-col text-center" onSubmit={(e: FormEvent<HTMLFormElement>) => createAccount(e)}>						
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
				}

			{/* login form */}
				{!showSignUp && !forgotPassword && <form className="signup era-1989 cursor-pointer shadow-md rounded px-8 pt-6 pb-6 mb-4 flex items-center justify-center flex-col text-center" onSubmit={(e: FormEvent<HTMLFormElement>) => login(e)}>					
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
				{alreadyExists && !showSignUp && <div>
					An account already exists for this email.  Please login. <p className='underline' onClick={()=> setForgotPassword(true)}>Forgot password?</p>
					</div>}

		{/* reset/forgot password  */}
				{forgotPassword && !showSignUp &&
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

export default SignUpPage