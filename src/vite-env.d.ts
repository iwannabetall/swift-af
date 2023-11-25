/// <reference types="vite/client" />

interface Lyrics {
	"song_full_name": string;
	"album":  string;
	"line_num": number;
	"lyric":  string;
	"track_n": number;
	"title_in_lyric_match": number;
	"line_word_count": number;
	"unique_lyric": number;
	"song": string;
	"filler": number;
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
	album: string;
	userResponse: string;	
	correct: number;
	lyric: string;
}
 