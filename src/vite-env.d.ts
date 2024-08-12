/// <reference types="vite/client" />

declare module 'obscenity';


interface Lyrics {
	id : number;
	song_full_name: string;
	album:  string;
	album_key: AlbumKey;
	line_num: number;
	lyric:  string;
	track_n: number;
	title_in_lyric_match: number;
	line_word_count: number;
	unique_lyric: number;
	song: string;
	filler: number;
	vault: number;
	total?: number;
	orig_lyric_id?: number;
}

interface BrushRange {
	x0: number | undefined;
	x1: number | undefined;
	y0: number | undefined;
	y1: number | undefined;
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

type AlbumKey = "Taylor_Swift" | "Fearless" | "Speak_Now" | 'Red' | '1989' | 'reputation' | 'Lover' | 'folklore' | 'evermore' | 'Midnights' | 'TTPD' 

// name of the jpg files of covers
type AlbumArt = "Taylor_Swift" | "Fearless" | "Speak_Now" | 'Red' | '1989' | 'reputation' | 'Lover' | 'folklore' | 'evermore' | 'Midnights' | 'imtheproblem' | 'TTPD'


type Album = "Taylor Swift" | "Fearless" | "Speak Now" | 'Red' | '1989' | 'reputation' | 'Lover' | 'folklore' | 'evermore' | 'Midnights' | 'THE TORTURED POETS DEPARTMENT'

type postGameDisplay = "stats" | "leaderboard"
type filterLeaderboard = 'all' | 'album'
type game_mode = 'easy' | 'classics version' | 'Tortured Classics' | "Taylor's Version" | "The Eras" | 'cult version' | 'album' 

interface SongList {
	song: string;
	album: string;
	vault: number;
	track_n: number;
	album_key: string;
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

interface Leaderboard {
	player_name: string; 
	game_id: string;
	accuracy: number;
	accuracy_rk: number;	
	time: number;
	speed_rk: number;	
	correct: number;
	total: number;
	album_mode: string;
	game_mode: string;	
	fighter: string;
	game_date: string;
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


interface GameResults {
	time: number; 
	song: string;
	album_key: AlbumKey;
	album: string;
	correct: number;
	lyric: string;
	lyric_id: number;
	game_mode: string;
	album_mode: string;
	level: string;
	game_date: string;
	date: string;
	game_id: string;	
}

interface AggGameStats {
	time: number | string; 
	song: string;
	album_key: AlbumKey;
	album: string;
	correct: number;
	accuracy: number;
	lyric: string;
	// lyric_id: number;
	game_date: string;
	date: string;
	game_mode: string;
	album_mode: string;
	game_id?: string;
	total?: number;
	play_count?:number;
	game_mode?: string;
	correct_time? : number;
	wrong_time? : number;
}


interface LyricData {
	album: string;
	album_key: AlbumKey;
	accuracy: number;
	time: number;
	filler: number;
	total: number;
	lyric: string;
	lyric_id: number;
	vault: number;
	song: string;
	// last for are for full lyrics
	track_n?: number;
	orig_lyric_id?: number;
	line_num?: number;
	title_in_lyric_match?: number;
	accuracy_group?: string;
}

interface SpotifyData{
	song: string;
	song_accuracy: number;
	daily_counts: number;
	historical_counts: number;
	album: string;
	top_lyric: string;
	lyrical_accuracy: number;
	lyrical_speed: number;
	lyrical_play_count:number;
}