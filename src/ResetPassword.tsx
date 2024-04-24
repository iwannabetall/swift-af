import { useState, FormEvent } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

import Layout from './Layout.tsx';
import * as TS from './Constants.tsx'

function ResetPassword() {

	const URL = TS.config.url

	// const [playerName, setPlayerName] = useState<string>('')
	const [userEmail, setUserEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [passwordMatch, setPasswordMatch] = useState<string>('')


	const [loginMessage, setLoginMessage] = useState<string>("\u00A0")
	
	const navigate = useNavigate()

	const confirm_id = window.location.pathname.split('i-forgot-you-existed/')[1]

	function submitReset(e: FormEvent<HTMLFormElement>){
		e.preventDefault()
		
		if (userEmail.length > 0 && password.length >= 8 && passwordMatch == password) {
	
			axios.post(`${URL}/reset/${confirm_id}`, {			
			email: userEmail.trim(),
			password: password,			
			})
			.then(function (response) {
					// if confirm url 
				if (response.data == 'expired'){

					setLoginMessage("Sorry, link has expired.  Please request another.")

				} else if (response.data == 'email mismatch') {

					setLoginMessage("Email doesn't match password request account.")

				} else if (response.data == 'other'){

					setLoginMessage("Sorry! Account not found, email sayhello@swift-af.com for help")

				} else if (response.data == 'success'){
					setLoginMessage("Password changed. Redirecting...")

					setTimeout(()=> navigate('/hi-its-me'), 2500)
					
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


	return (
		<>
		<Layout isLoading={false}>
			
			<div>
				<h2>Let's try to not forget your password existed</h2>
			</div>
			
			<div className='signup flex flex-col container bold text-center justify-center items-center'>					
				<p>{loginMessage}</p>
				<div>
				<form className="signup era-1989 cursor-pointer shadow-md rounded px-8 pt-6 pb-6 mb-4 flex items-center justify-center flex-col text-center" onSubmit={(e: FormEvent<HTMLFormElement>) => submitReset(e)}>
					<label htmlFor='email'>Email
					<input className="input-form shadow cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-center" type='email' 
						id='email'
						value={userEmail} 
						placeholder='Email'
						maxLength={120}
						onChange={e => {
							// if (loginMessage.length > 0) {
							// 	setLoginMessage('')
							// }
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
							// if (loginMessage.length > 0) {
							// 	setLoginMessage('')
							// }
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
				</div>
			
			</div>
		</Layout>
		</>
	)

}

export default ResetPassword