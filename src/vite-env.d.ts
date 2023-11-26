/// <reference types="vite/client" />

interface Lyrics {
	"song_full_name": string;
	"album":  string;
	"album_key":  string;
	"line_num": number;
	"lyric":  string;
	"track_n": number;
	"title_in_lyric_match": number;
	"line_word_count": number;
	"unique_lyric": number;
	"song": string;
	"filler": number;
}

interface albumColorKey {
	'Taylor_Swift': string;
	'Fearless': string;
	'Speak_Now': string;
	'Red': string;
	'1989': string;
	'reputation': string;
	'Lover': string;
	'folklore': string;
	'evermore': string;
	'Midnights': string;
		
}

interface SongList {
	"song": string;
	"album": string;
}

declare global {
	let lyricsDB: Lyrics[] = [];
	let songList: SongList[] = [];
}

interface GameStats {
	time: number; 
	song: string;
	album_key:  string;
	album: string;
	userResponse: string;	
	correct: number;
	lyric: string;
}
 