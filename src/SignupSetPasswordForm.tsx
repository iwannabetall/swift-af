import { useState, FormEvent } from 'react'
import axios from 'axios'

function SignupSetPasswordForm ({ handleSubmit } : { handleSubmit : (e: FormEvent<HTMLFormElement>) => void} ){

	const [userEmail, setUserEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [passwordMatch, setPasswordMatch] = useState<string>('')

	// const [loginMessage, setLoginMessage] = useState<string>("\u00A0")

	return (
		<form className="signup era-1989 cursor-pointer shadow-md rounded px-8 pt-6 pb-6 mb-4 flex items-center justify-center flex-col text-center" onSubmit={(e: FormEvent<HTMLFormElement>) => handleSubmit(e)}>
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

	)
	
}

export default SignupSetPasswordForm