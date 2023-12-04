/// <reference types="vite/client" />

declare module 'obscenity';

interface Lyrics {
	"id" : number;
	"song_full_name": string;
	"album":  string;
	"album_key": AlbumKey;
	"line_num": number;
	"lyric":  string;
	"track_n": number;
	"title_in_lyric_match": number;
	"line_word_count": number;
	"unique_lyric": number;
	"song": string;
	"filler": number;
	"vault": number;
}

// interface albumColorKey {
// 	'Taylor_Swift': string;
// 	'Fearless': string;
// 	'Speak_Now': string;
// 	'Red': string;
// 	'1989': string;
// 	'reputation': string;
// 	'Lover': string;
// 	'folklore': string;
// 	'evermore': string;
// 	'Midnights': string;
		
// }

type AlbumKey = "Taylor_Swift" | "Fearless" | "Speak_Now" | 'Red' | '1989' | 'reputation' | 'Lover' | 'folklore' | 'evermore' | 'Midnights' 

type AlbumArt = "Taylor_Swift" | "Fearless" | "Speak_Now" | 'Red' | 'TS1989' | 'reputation' | 'Lover' | 'folklore' | 'evermore' | 'Midnights' | 'imtheproblem'


type Album = "Taylor Swift" | "Fearless" | "Speak Now" | 'Red' | '1989' | 'reputation' | 'Lover' | 'folklore' | 'evermore' | 'Midnights' 

type postGameDisplay = "stats" | "leaderboard"
type filterLeaderboard = 'all' | 'album'

interface SongList {
	"song": string;
	"album": string;
	"vault": number;
}

declare global {
	var lyricsFullDB: Lyrics[];
	var songList: SongList[];
}

interface StatsByAlbum {
	album: string;
	correct: number;
	total: number;
	avgTime: string;
	albumKey: AlbumKey;
}

interface GameStats {
	time: number; 
	song: string;
	album_key: AlbumKey;
	album: string;
	userResponse: string;	
	correct: number;
	lyric: string;
	lyric_id: number;
	level: string;
	id: number;
}
 

interface Leaderboard {
	player_name: string; 
	game_id: string;
	accuracy: number;
	accuracy_rk: number;
	accuracy_pctl: number;
	time: number;
	speed_rk: number;
	speed_pctl: number;
	correct: number;
	total: number;
	album_mode: string;
	game_mode: string;	
	fighter: string;
}
