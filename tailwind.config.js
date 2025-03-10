/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
		colors: {...colors, 
			'eras_green': 'rgb(185,210,181)',
			'eras_gold': 'rgb(244,203,141)',
			'eras_purple': 'rgb(209,178,210)',
			'eras_maroon':'rgb(130,53,73)',
			'eras_lblue': 'rgb(181,233,246)',
			'eras_pink': 'rgb(249,178,208)',
			'eras_tan': 'rgb(200,174,149)',
			'eras_grey': 'rgb(207,202,198)',
			'eras_indigo': 'rgb(67,73,97)',
		}
  },
  plugins: [],
	safelist: [{
		pattern: /(mt|mb|mr|ml|my|mx|px|py|pt|pb|pl|pr)-[0-9]+/
		},
		{
			pattern: /flex-.*/
		},
		{
			pattern: /(bottom|right|top|left)-[0-9]+/
		},
		{
			pattern: /(w|h)-[0-9]+/
		}
]
}