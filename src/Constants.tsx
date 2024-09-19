const production = {
  url: 'https://swift-api.fly.dev'
};

const development = {
  url: 'http://localhost:3000'
};

export const config: { url: string } = process.env.NODE_ENV === 'development' ? development : production; 

// for data viz
export const margin = 30
export const marginBottom = 45
export const marginTop = 36
export const marginLeft = 60
export const marginRight = 15

export const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights', 'TTPD': 'era-ttpd'} as const

export const albumColorKeyvLighter = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights-lighter', 'TTPD': 'era-ttpd-lighter'} as const

export const albumKeyLkup = { "Taylor Swift" : "Taylor_Swift", "Fearless" : "Fearless", "Speak Now" : "Speak_Now", 'Red' : 'Red', '1989' : '1989', 'reputation' : 'reputation', 'Lover' : 'Lover', 'folklore' : 'folklore', 'evermore' : 'evermore', 'Midnights' : 'Midnights', 'THE TORTURED POETS DEPARTMENT': 'TTPD'} as const

export const albums = ["Taylor Swift", "Fearless", "Speak Now", "Red", "1989", "reputation", "Lover", "folklore", "evermore", "Midnights", "THE TORTURED POETS DEPARTMENT"] as const

export const albumCovers = ["Taylor_Swift", "Fearless", "Speak_Now", "Red", "1989", "reputation", "Lover", "folklore", "evermore", "Midnights", 'TTPD'] as const
