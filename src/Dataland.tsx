// import { useState, useEffect, MouseEvent } from 'react'
import { useState, useEffect, useRef } from 'react'
import title from '/title.svg'
import axios from 'axios';
import Nav from './Nav.tsx'
import * as d3 from 'd3';
import { InView } from "react-intersection-observer";
import Loader from './Loader.tsx';
import useScreenSize from './useScreenSize.tsx';
import LyricalVizLegend from './LyricalVizLegend.tsx';

// import moment from 'moment';

let lyricStats: LyricData[] = []   //unique list of lyrics w/speed/accuracy stats

// 
let fullLyricsNStats: LyricData[] = []  // lyrics for a song with accuracy/speed but not unique list of lyrics 
let songsFullDB: SongList[] = [] // all songs 

var spotify_full_data = [{'song': 'All Too Well (10 Minute Version)',
'accuracy': 96.00886918,
'daily_counts': 828429,
'historical_counts': 798.581857,
'top_lyric': '"I\'ll get older, but your lovers stay my age"',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.38,
'lyrical_play_count': 14,
'album': 'Red'},
{'song': 'the last great american dynasty',
'accuracy': 94.97816594,
'daily_counts': 359252,
'historical_counts': 352.387356,
'top_lyric': 'Holiday House sat quietly on that beach',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.63,
'lyrical_play_count': 41,
'album': 'folklore'},
{'song': 'The Man',
'accuracy': 94.69194313,
'daily_counts': 818259,
'historical_counts': 724.184313,
'top_lyric': "I'd be an alpha type",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.38,
'lyrical_play_count': 31,
'album': 'Lover'},
{'song': 'All Too Well',
'accuracy': 93.70277078,
'daily_counts': 349636,
'historical_counts': 531.67939,
'top_lyric': 'You remember it all',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.45,
'lyrical_play_count': 28,
'album': 'Red'},
{'song': 'no body, no crime',
'accuracy': 93.62549801,
'daily_counts': 214899,
'historical_counts': 260.057041,
'top_lyric': 'Hе reports his missing wife',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.21,
'lyrical_play_count': 37,
'album': 'evermore'},
{'song': 'Vigilante Shit',
'accuracy': 93.5483871,
'daily_counts': 401539,
'historical_counts': 367.870021,
'top_lyric': 'Draw the cat eye sharp enough to kill a man',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.24,
'lyrical_play_count': 35,
'album': 'Midnights'},
{'song': 'Anti-Hero',
'accuracy': 92.91784703,
'daily_counts': 1858417,
'historical_counts': 1539.644892,
'top_lyric': "It's me, hi",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.16,
'lyrical_play_count': 70,
'album': 'Midnights'},
{'song': 'Shake It Off',
'accuracy': 92.67767408,
'daily_counts': 1206044,
'historical_counts': 1433.785645,
'top_lyric': 'Cause the players gonna play, play, play, play, play',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.09,
'lyrical_play_count': 39,
'album': '1989'},
{'song': 'Lover',
'accuracy': 92.5445705,
'daily_counts': 2030402,
'historical_counts': 1595.171925,
'top_lyric': 'Can I go where you go?',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.76,
'lyrical_play_count': 34,
'album': 'Lover'},
{'song': 'Is It Over Now?',
'accuracy': 92.29946524,
'daily_counts': 1480589,
'historical_counts': 332.565994,
'top_lyric': "Only rumors 'bout my hips and thighs",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.53,
'lyrical_play_count': 22,
'album': '1989'},
{'song': 'Blank Space',
'accuracy': 91.44811859,
'daily_counts': 1708484,
'historical_counts': 1880.928875,
'top_lyric': '"Oh my God, who is she?"',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.68,
'lyrical_play_count': 35,
'album': '1989'},
{'song': 'You Need To Calm Down',
'accuracy': 91.29464286,
'daily_counts': 683496,
'historical_counts': 907.800363,
'top_lyric': "You're being too loud (You're being too loud)",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.49,
'lyrical_play_count': 24,
'album': 'Lover'},
{'song': 'We Are Never Ever Getting Back Together',
'accuracy': 91.28919861,
'daily_counts': 772480,
'historical_counts': 950.176303,
'top_lyric': 'Like, ever',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.23,
'lyrical_play_count': 30,
'album': 'Red'},
{'song': 'Mr. Perfectly Fine',
'accuracy': 91.20879121,
'daily_counts': 295611,
'historical_counts': 349.88446,
'top_lyric': 'Cause I was Miss "Here to stay"',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.39,
'lyrical_play_count': 11,
'album': 'Fearless'},
{'song': 'champagne problems',
'accuracy': 91.10169492,
'daily_counts': 604674,
'historical_counts': 570.479082,
'top_lyric': 'Because I dropped your hand while dancing',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.75,
'lyrical_play_count': 38,
'album': 'evermore'},
{'song': 'Castles Crumbling',
'accuracy': 90.46153846,
'daily_counts': 122771,
'historical_counts': 73.701007,
'top_lyric': '(Once, I had an empire)',
'lyrical_accuracy': 97.3,
'lyrical_speed': 2.92,
'lyrical_play_count': 37,
'album': 'Speak Now'},
{'song': 'You Belong With Me',
'accuracy': 90.39767216,
'daily_counts': 1293391,
'historical_counts': 1208.639565,
'top_lyric': "She's Cheer Captain and I'm on the bleachers",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.75,
'lyrical_play_count': 33,
'album': 'Fearless'},
{'song': 'tolerate it',
'accuracy': 90.34883721,
'daily_counts': 425837,
'historical_counts': 284.308439,
'top_lyric': 'I know my love should be celebrated',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.25,
'lyrical_play_count': 39,
'album': 'evermore'},
{'song': 'Welcome to New York',
'accuracy': 90.30023095,
'daily_counts': 412105,
'historical_counts': 335.21532,
'top_lyric': 'So bright, they never blind me',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.41,
'lyrical_play_count': 39,
'album': '1989'},
{'song': 'You’re Losing Me',
'accuracy': 90.28960818,
'daily_counts': 911258,
'historical_counts': 166.071702,
'top_lyric': "I'm getting tired even for a phoenix",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.59,
'lyrical_play_count': 21,
'album': 'Midnights'},
{'song': 'Look What You Made Me Do',
'accuracy': 90.05076142,
'daily_counts': 812301,
'historical_counts': 1095.286627,
'top_lyric': '"Why? Oh, \'cause she\'s dead!" (Oh)',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.97,
'lyrical_play_count': 28,
'album': 'reputation'},
{'song': 'Cruel Summer',
'accuracy': 89.56262425,
'daily_counts': 4838871,
'historical_counts': 1894.418735,
'top_lyric': 'Devils roll the dice, angels roll their eyes',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.42,
'lyrical_play_count': 27,
'album': 'Lover'},
{'song': 'When Emma Falls in Love',
'accuracy': 89.54703833,
'daily_counts': 119235,
'historical_counts': 72.196329,
'top_lyric': "Cause she's the kind of book that you can't put down",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.79,
'lyrical_play_count': 30,
'album': 'Speak Now'},
{'song': '22',
'accuracy': 89.33333333,
'daily_counts': 603582,
'historical_counts': 630.90551,
'top_lyric': "Tonight's the night when we forget about the heartbreaks",
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.57,
'lyrical_play_count': 36,
'album': 'Red'},
{'song': 'Better Than Revenge',
'accuracy': 89.33002481,
'daily_counts': 279886,
'historical_counts': 305.040443,
'top_lyric': "Soon she's gonna find stealing other people's toys",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.64,
'lyrical_play_count': 27,
'album': 'Speak Now'},
{'song': 'I Bet You Think About Me',
'accuracy': 89.26380368,
'daily_counts': 169891,
'historical_counts': 201.199928,
'top_lyric': 'With your organic shoes and your million-dollar couch',
'lyrical_accuracy': 95.24,
'lyrical_speed': 3.02,
'lyrical_play_count': 21,
'album': 'Red'},
{'song': 'Back to December',
'accuracy': 89.09657321,
'daily_counts': 570229,
'historical_counts': 625.713286,
'top_lyric': "How's life? Tell me, how's your family?",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.79,
'lyrical_play_count': 30,
'album': 'Speak Now'},
{'song': 'This Is Why We Can’t Have Nice Things',
'accuracy': 89.03177005,
'daily_counts': 183150,
'historical_counts': 209.43037,
'top_lyric': "If only you weren't so shady",
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.06,
'lyrical_play_count': 34,
'album': 'reputation'},
{'song': 'Bejeweled',
'accuracy': 88.90688259,
'daily_counts': 637358,
'historical_counts': 491.884754,
'top_lyric': "A diamond's gotta shine",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.43,
'lyrical_play_count': 54,
'album': 'Midnights'},
{'song': 'New Romantics',
'accuracy': 88.67243867,
'daily_counts': 483308,
'historical_counts': 367.822145,
'top_lyric': 'We need love, but all we want is danger',
'lyrical_accuracy': 97.96,
'lyrical_speed': 3.42,
'lyrical_play_count': 49,
'album': '1989'},
{'song': 'Gorgeous',
'accuracy': 88.55646971,
'daily_counts': 427747,
'historical_counts': 566.477342,
'top_lyric': "But if you're single that's honestly worse",
'lyrical_accuracy': 98.0,
'lyrical_speed': 3.05,
'lyrical_play_count': 50,
'album': 'reputation'},
{'song': 'New Year’s Day',
'accuracy': 88.35690968,
'daily_counts': 181327,
'historical_counts': 183.854172,
'top_lyric': "There's glitter on the floor after the party",
'lyrical_accuracy': 97.83,
'lyrical_speed': 2.69,
'lyrical_play_count': 92,
'album': 'reputation'},
{'song': 'Out of the Woods',
'accuracy': 88.34405145,
'daily_counts': 474224,
'historical_counts': 425.92873,
'top_lyric': 'But the monsters turned out to be just trees',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.24,
'lyrical_play_count': 26,
'album': '1989'},
{'song': 'willow',
'accuracy': 88.02017654,
'daily_counts': 819281,
'historical_counts': 860.043471,
'top_lyric': "But I come back stronger than a '90s trend",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.3,
'lyrical_play_count': 27,
'album': 'evermore'},
{'song': 'London Boy',
'accuracy': 87.98908098,
'daily_counts': 293015,
'historical_counts': 309.363838,
'top_lyric': 'We can go driving in, on my scooter',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.08,
'lyrical_play_count': 34,
'album': 'Lover'},
{'song': 'I Did Something Bad',
'accuracy': 87.9709187,
'daily_counts': 375972,
'historical_counts': 417.017766,
'top_lyric': "But if he drops my name, then I owe him nothin'",
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.91,
'lyrical_play_count': 43,
'album': 'reputation'},
{'song': 'Getaway Car',
'accuracy': 87.52703677,
'daily_counts': 737525,
'historical_counts': 618.176317,
'top_lyric': 'Put the money in a bag and I stole the keys',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.44,
'lyrical_play_count': 48,
'album': 'reputation'},
{'song': 'my tears ricochet',
'accuracy': 87.31884058,
'daily_counts': 556534,
'historical_counts': 460.919597,
'top_lyric': 'Cursing my name, wishing I stayed',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.48,
'lyrical_play_count': 67,
'album': 'folklore'},
{'song': 'Bigger Than The Whole Sky',
'accuracy': 87.2611465,
'daily_counts': 192259,
'historical_counts': 170.401206,
'top_lyric': 'Goodbye, goodbye, goodbye',
'lyrical_accuracy': 96.55,
'lyrical_speed': 2.54,
'lyrical_play_count': 29,
'album': 'Midnights'},
{'song': '“Slut!”',
'accuracy': 87.14121699,
'daily_counts': 1011204,
'historical_counts': 213.920724,
'top_lyric': 'Got lovesick all over my bed',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.28,
'lyrical_play_count': 47,
'album': '1989'},
{'song': 'Wildest Dreams',
'accuracy': 87.13156003,
'daily_counts': 1350796,
'historical_counts': 1607.342237,
'top_lyric': "Say you'll remember me",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.74,
'lyrical_play_count': 39,
'album': '1989'},
{'song': 'august',
'accuracy': 87.04819277,
'daily_counts': 1310219,
'historical_counts': 1015.561112,
'top_lyric': "Cancel plans just in case you'd call",
'lyrical_accuracy': 97.96,
'lyrical_speed': 2.77,
'lyrical_play_count': 49,
'album': 'folklore'},
{'song': 'Clean',
'accuracy': 86.74242424,
'daily_counts': 352527,
'historical_counts': 270.61028,
'top_lyric': 'Ten months sober, I must admit',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.3,
'lyrical_play_count': 36,
'album': '1989'},
{'song': 'the 1',
'accuracy': 86.57047725,
'daily_counts': 553357,
'historical_counts': 553.451807,
'top_lyric': "It would've been you",
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.24,
'lyrical_play_count': 29,
'album': 'folklore'},
{'song': 'illicit affairs',
'accuracy': 86.38228056,
'daily_counts': 660294,
'historical_counts': 385.146345,
'top_lyric': 'Make sure nobody sees you leave',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.95,
'lyrical_play_count': 33,
'album': 'folklore'},
{'song': 'Now That We Don’t Talk',
'accuracy': 86.06811146,
'daily_counts': 907670,
'historical_counts': 220.375723,
'top_lyric': 'I call my mom, she said to get it off my chest (Off my chest)',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.31,
'lyrical_play_count': 23,
'album': '1989'},
{'song': 'Long Live',
'accuracy': 86.00508906,
'daily_counts': 384343,
'historical_counts': 213.449199,
'top_lyric': 'I had the time of my life fighting dragons with you',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.05,
'lyrical_play_count': 28,
'album': 'Speak Now'},
{'song': '...Ready for It?',
'accuracy': 85.96614951,
'daily_counts': 814919,
'historical_counts': 695.764045,
'top_lyric': 'I-Island breeze and lights down low',
'lyrical_accuracy': 97.62,
'lyrical_speed': 3.74,
'lyrical_play_count': 42,
'album': 'reputation'},
{'song': 'marjorie',
'accuracy': 85.82020389,
'daily_counts': 292749,
'historical_counts': 196.546182,
'top_lyric': "You're alive, you're alive in my head",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.44,
'lyrical_play_count': 34,
'album': 'evermore'},
{'song': 'Mastermind',
'accuracy': 85.8044164,
'daily_counts': 362579,
'historical_counts': 317.349147,
'top_lyric': 'It was all by dеsign',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.45,
'lyrical_play_count': 39,
'album': 'Midnights'},
{'song': '’tis the damn season',
'accuracy': 85.74162679,
'daily_counts': 262215,
'historical_counts': 252.719118,
'top_lyric': 'And the road not taken looks real good now',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.89,
'lyrical_play_count': 29,
'album': 'evermore'},
{'song': 'Style',
'accuracy': 85.72542902,
'daily_counts': 1515988,
'historical_counts': 1316.500151,
'top_lyric': 'You got that James Dean daydream look in your eye',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.26,
'lyrical_play_count': 118,
'album': '1989'},
{'song': 'Karma',
'accuracy': 85.69518717,
'daily_counts': 1215821,
'historical_counts': 788.632919,
'top_lyric': 'Flexing like a goddamn acrobat',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.02,
'lyrical_play_count': 34,
'album': 'Midnights'},
{'song': 'Forever Winter',
'accuracy': 85.61643836,
'daily_counts': 85895,
'historical_counts': 87.790536,
'top_lyric': "All this time, I didn't know",
'lyrical_accuracy': 86.36,
'lyrical_speed': 4.31,
'lyrical_play_count': 22,
'album': 'Red'},
{'song': 'Delicate',
'accuracy': 85.54396423,
'daily_counts': 847058,
'historical_counts': 1019.641841,
'top_lyric': 'Oh, damn, never seen that color blue',
'lyrical_accuracy': 97.5,
'lyrical_speed': 3.99,
'lyrical_play_count': 40,
'album': 'reputation'},
{'song': 'Mean',
'accuracy': 85.52774755,
'daily_counts': 262660,
'historical_counts': 317.804641,
'top_lyric': "Someday, I'll be big enough so you can't hit me",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.41,
'lyrical_play_count': 26,
'album': 'Speak Now'},
{'song': 'Our Song',
'accuracy': 85.12658228,
'daily_counts': 304633,
'historical_counts': 319.114264,
'top_lyric': 'Asking God if he could play it again',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.55,
'lyrical_play_count': 25,
'album': 'Taylor Swift'},
{'song': 'Timeless',
'accuracy': 85.04201681,
'daily_counts': 144409,
'historical_counts': 73.849813,
'top_lyric': "Even if we'd met on a crowded street in 1944",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.24,
'lyrical_play_count': 22,
'album': 'Speak Now'},
{'song': 'Nothing New',
'accuracy': 85.02994012,
'daily_counts': 211224,
'historical_counts': 203.767882,
'top_lyric': "How long will it be cute, all this cryin' in my room?",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.65,
'lyrical_play_count': 21,
'album': 'Red'},
{'song': 'Dear John',
'accuracy': 84.99573743,
'daily_counts': 221420,
'historical_counts': 239.933495,
'top_lyric': 'Never impressed by me acing your tests',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.08,
'lyrical_play_count': 30,
'album': 'Speak Now'},
{'song': 'this is me trying',
'accuracy': 84.92268041,
'daily_counts': 463454,
'historical_counts': 381.264085,
'top_lyric': "I've been having a hard time adjusting",
'lyrical_accuracy': 94.44,
'lyrical_speed': 3.36,
'lyrical_play_count': 36,
'album': 'folklore'},
{'song': 'We Were Happy',
'accuracy': 84.79532164,
'daily_counts': 55623,
'historical_counts': 56.248501,
'top_lyric': "Talking 'bout your daddy's farm we were gonna buy someday",
'lyrical_accuracy': 78.26,
'lyrical_speed': 4.21,
'lyrical_play_count': 23,
'album': 'Fearless'},
{'song': 'You’re On Your Own, Kid',
'accuracy': 84.78991597,
'daily_counts': 765384,
'historical_counts': 535.629617,
'top_lyric': 'From sprinkler splashes to fireplace ashes',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.97,
'lyrical_play_count': 39,
'album': 'Midnights'},
{'song': 'Never Grow Up',
'accuracy': 84.71760797,
'daily_counts': 117843,
'historical_counts': 133.973455,
'top_lyric': "Your little hand's wrapped around my finger",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.62,
'lyrical_play_count': 29,
'album': 'Speak Now'},
{'song': 'High Infidelity',
'accuracy': 84.58376156,
'daily_counts': 137738,
'historical_counts': 144.054658,
'top_lyric': 'Do you really wanna know where I was April 29th?',
'lyrical_accuracy': 97.67,
'lyrical_speed': 2.84,
'lyrical_play_count': 43,
'album': 'Midnights'},
{'song': 'betty',
'accuracy': 84.56269758,
'daily_counts': 339791,
'historical_counts': 350.367549,
'top_lyric': 'Will you kiss me on the porch',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.91,
'lyrical_play_count': 31,
'album': 'folklore'},
{'song': 'Miss Americana & The Heartbreak Prince',
'accuracy': 84.43579767,
'daily_counts': 568862,
'historical_counts': 340.133007,
'top_lyric': 'American stories burning before me',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.88,
'lyrical_play_count': 33,
'album': 'Lover'},
{'song': 'Red',
'accuracy': 84.43113772,
'daily_counts': 390256,
'historical_counts': 533.669301,
'top_lyric': 'Loving him is like',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.66,
'lyrical_play_count': 25,
'album': 'Red'},
{'song': 'Fifteen',
'accuracy': 84.40366972,
'daily_counts': 145522,
'historical_counts': 208.028781,
'top_lyric': "It's your freshman year and you're gonna be here",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.65,
'lyrical_play_count': 22,
'album': 'Fearless'},
{'song': 'the lakes',
'accuracy': 84.31845597,
'daily_counts': 233559,
'historical_counts': 196.751017,
'top_lyric': 'I want to watch wisteria grow right over my bare feet',
'lyrical_accuracy': 96.67,
'lyrical_speed': 3.55,
'lyrical_play_count': 30,
'album': 'folklore'},
{'song': 'Would’ve, Could’ve, Should’ve',
'accuracy': 84.24803991,
'daily_counts': 271168,
'historical_counts': 249.751321,
'top_lyric': "If I never blushed, then they could've",
'lyrical_accuracy': 97.3,
'lyrical_speed': 3.62,
'lyrical_play_count': 37,
'album': 'Midnights'},
{'song': 'gold rush',
'accuracy': 84.24317618,
'daily_counts': 240192,
'historical_counts': 272.063104,
'top_lyric': "I don't like anticipatin' my face in a red flush",
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.22,
'lyrical_play_count': 31,
'album': 'evermore'},
{'song': 'You Are in Love',
'accuracy': 84.04605263,
'daily_counts': 242346,
'historical_counts': 201.676567,
'top_lyric': 'You can feel it on the way home',
'lyrical_accuracy': 97.5,
'lyrical_speed': 3.33,
'lyrical_play_count': 80,
'album': '1989'},
{'song': 'Better Man',
'accuracy': 84.02366864,
'daily_counts': 142339,
'historical_counts': 135.103269,
'top_lyric': 'But your jealousy, oh, I can hear it now',
'lyrical_accuracy': 93.33,
'lyrical_speed': 3.51,
'lyrical_play_count': 15,
'album': 'Red'},
{'song': 'Picture To Burn',
'accuracy': 83.98533007,
'daily_counts': 155886,
'historical_counts': 183.34509,
'top_lyric': 'I realize you love yourself more than you could ever love me',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.68,
'lyrical_play_count': 33,
'album': 'Taylor Swift'},
{'song': 'exile',
'accuracy': 83.93113343,
'daily_counts': 675345,
'historical_counts': 757.25688,
'top_lyric': "I couldn't turn things around (You never turned things around)",
'lyrical_accuracy': 97.22,
'lyrical_speed': 3.66,
'lyrical_play_count': 36,
'album': 'folklore'},
{'song': 'cardigan',
'accuracy': 83.8673412,
'daily_counts': 1629331,
'historical_counts': 1252.182331,
'top_lyric': 'You put me on and said I was your favorite',
'lyrical_accuracy': 97.56,
'lyrical_speed': 2.72,
'lyrical_play_count': 41,
'album': 'folklore'},
{'song': 'seven',
'accuracy': 83.78378378,
'daily_counts': 297386,
'historical_counts': 302.280191,
'top_lyric': 'Sweet tea in the summer',
'lyrical_accuracy': 95.24,
'lyrical_speed': 3.76,
'lyrical_play_count': 42,
'album': 'folklore'},
{'song': 'right where you left me',
'accuracy': 83.69230769,
'daily_counts': 415708,
'historical_counts': 302.797236,
'top_lyric': "Help, I'm still at the restaurant",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.17,
'lyrical_play_count': 26,
'album': 'evermore'},
{'song': 'Love Story',
'accuracy': 83.47183749,
'daily_counts': 1580463,
'historical_counts': 1581.270493,
'top_lyric': '"Marry me, Juliet, you\'ll never have to be alone',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.11,
'lyrical_play_count': 30,
'album': 'Fearless'},
{'song': 'I Can See You',
'accuracy': 83.40611354,
'daily_counts': 350207,
'historical_counts': 223.113923,
'top_lyric': "So it's best that we move fast and keep quiet",
'lyrical_accuracy': 95.24,
'lyrical_speed': 3.79,
'lyrical_play_count': 21,
'album': 'Speak Now'},
{'song': 'Say Don’t Go',
'accuracy': 83.39393939,
'daily_counts': 466800,
'historical_counts': 148.479244,
'top_lyric': "I'm holdin' out hope for you to",
'lyrical_accuracy': 96.0,
'lyrical_speed': 2.76,
'lyrical_play_count': 25,
'album': '1989'},
{'song': 'mirrorball',
'accuracy': 83.31627431,
'daily_counts': 444554,
'historical_counts': 404.936394,
'top_lyric': "I'll show you every version of yourself tonight",
'lyrical_accuracy': 97.59,
'lyrical_speed': 3.14,
'lyrical_play_count': 83,
'album': 'folklore'},
{'song': 'Foolish One',
'accuracy': 83.11965812,
'daily_counts': 186024,
'historical_counts': 80.478581,
'top_lyric': "You will learn the hard way instead of just walkin' out",
'lyrical_accuracy': 91.67,
'lyrical_speed': 3.76,
'lyrical_play_count': 24,
'album': 'Speak Now'},
{'song': 'Enchanted',
'accuracy': 83.09503785,
'daily_counts': 1220719,
'historical_counts': 1015.736919,
'top_lyric': 'Your eyes whispered, "Have we met?"',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.07,
'lyrical_play_count': 33,
'album': 'Speak Now'},
{'song': 'Paper Rings',
'accuracy': 83.07086614,
'daily_counts': 599131,
'historical_counts': 607.440456,
'top_lyric': 'I want your dreary Mondays',
'lyrical_accuracy': 96.77,
'lyrical_speed': 3.54,
'lyrical_play_count': 31,
'album': 'Lover'},
{'song': 'Suburban Legends',
'accuracy': 83.01329394,
'daily_counts': 239390,
'historical_counts': 91.001074,
'top_lyric': 'When I ended up back at our class reunion',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.05,
'lyrical_play_count': 24,
'album': '1989'},
{'song': 'Glitch',
'accuracy': 83.00970874,
'daily_counts': 111017,
'historical_counts': 114.797035,
'top_lyric': 'A brief interruption, a slight malfunction',
'lyrical_accuracy': 96.15,
'lyrical_speed': 3.66,
'lyrical_play_count': 26,
'album': 'Midnights'},
{'song': 'Lavender Haze',
'accuracy': 82.91571754,
'daily_counts': 664675,
'historical_counts': 724.656444,
'top_lyric': 'Get it off my desk (Get it off my desk)',
'lyrical_accuracy': 97.06,
'lyrical_speed': 3.5,
'lyrical_play_count': 68,
'album': 'Midnights'},
{'song': 'invisible string',
'accuracy': 82.8854314,
'daily_counts': 393745,
'historical_counts': 351.948891,
'top_lyric': 'Tying you to me?',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.75,
'lyrical_play_count': 38,
'album': 'folklore'},
{'song': 'ME!',
'accuracy': 82.83783784,
'daily_counts': 341860,
'historical_counts': 840.391228,
'top_lyric': "I promise that you'll never find another like",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.41,
'lyrical_play_count': 31,
'album': 'Lover'},
{'song': 'epiphany',
'accuracy': 82.58706468,
'daily_counts': 160783,
'historical_counts': 183.721884,
'top_lyric': 'Keep your helmet, keep your life, son',
'lyrical_accuracy': 89.36,
'lyrical_speed': 3.55,
'lyrical_play_count': 47,
'album': 'folklore'},
{'song': 'mad woman',
'accuracy': 82.54252462,
'daily_counts': 189702,
'historical_counts': 211.332444,
'top_lyric': 'Every time you call me crazy, I get more crazy',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.58,
'lyrical_play_count': 30,
'album': 'folklore'},
{'song': 'The Great War',
'accuracy': 82.34453181,
'daily_counts': 261693,
'historical_counts': 261.330173,
'top_lyric': 'Broken and blue, so I called off the troops',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.19,
'lyrical_play_count': 33,
'album': 'Midnights'},
{'song': 'State of Grace',
'accuracy': 82.1812596,
'daily_counts': 158381,
'historical_counts': 250.619191,
'top_lyric': 'And right and real',
'lyrical_accuracy': 92.31,
'lyrical_speed': 3.19,
'lyrical_play_count': 26,
'album': 'Red'},
{'song': 'Speak Now',
'accuracy': 82.11382114,
'daily_counts': 209583,
'historical_counts': 238.249229,
'top_lyric': 'And she is yelling at a bridesmaid',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.31,
'lyrical_play_count': 26,
'album': 'Speak Now'},
{'song': 'Cornelia Street',
'accuracy': 82.08802456,
'daily_counts': 364458,
'historical_counts': 374.980583,
'top_lyric': "That's the kinda heartbreak time could never mend",
'lyrical_accuracy': 96.43,
'lyrical_speed': 4.47,
'lyrical_play_count': 28,
'album': 'Lover'},
{'song': 'Death by a Thousand Cuts',
'accuracy': 82.05645161,
'daily_counts': 252884,
'historical_counts': 308.50667,
'top_lyric': "I ask the traffic lights if it'll be alright",
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.46,
'lyrical_play_count': 29,
'album': 'Lover'},
{'song': 'Paris',
'accuracy': 82.00514139,
'daily_counts': 163593,
'historical_counts': 171.276499,
'top_lyric': 'Stumbled down pretend alleyways',
'lyrical_accuracy': 97.37,
'lyrical_speed': 3.63,
'lyrical_play_count': 38,
'album': 'Midnights'},
{'song': 'I Know Places',
'accuracy': 81.98757764,
'daily_counts': 212197,
'historical_counts': 199.294031,
'top_lyric': "And they'll be chasing their tails trying to track us down",
'lyrical_accuracy': 97.62,
'lyrical_speed': 3.63,
'lyrical_play_count': 42,
'album': '1989'},
{'song': 'closure',
'accuracy': 81.86889819,
'daily_counts': 106165,
'historical_counts': 115.995807,
'top_lyric': "I know that it's over, I don't need your",
'lyrical_accuracy': 97.73,
'lyrical_speed': 3.84,
'lyrical_play_count': 44,
'album': 'evermore'},
{'song': 'False God',
'accuracy': 81.81818182,
'daily_counts': 279383,
'historical_counts': 218.34064,
'top_lyric': 'The altar is my hips',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.09,
'lyrical_play_count': 35,
'album': 'Lover'},
{'song': 'How You Get the Girl',
'accuracy': 81.72147002,
'daily_counts': 238417,
'historical_counts': 226.198927,
'top_lyric': 'And you were too afraid to tell her what you want, want',
'lyrical_accuracy': 95.45,
'lyrical_speed': 3.84,
'lyrical_play_count': 44,
'album': '1989'},
{'song': 'Babe',
'accuracy': 81.69014085,
'daily_counts': 156071,
'historical_counts': 224.953704,
'top_lyric': "Since you admitted it (Oh-oh), I keep picturin' (Oh-oh)",
'lyrical_accuracy': 95.65,
'lyrical_speed': 3.93,
'lyrical_play_count': 23,
'album': 'Red'},
{'song': 'coney island',
'accuracy': 81.60690571,
'daily_counts': 152162,
'historical_counts': 169.770435,
'top_lyric': 'Sorry for not winning you an arcade ring',
'lyrical_accuracy': 98.0,
'lyrical_speed': 3.19,
'lyrical_play_count': 50,
'album': 'evermore'},
{'song': 'The Archer',
'accuracy': 81.44444444,
'daily_counts': 516662,
'historical_counts': 377.01889,
'top_lyric': "Combat, I'm ready for combat",
'lyrical_accuracy': 96.88,
'lyrical_speed': 2.52,
'lyrical_play_count': 32,
'album': 'Lover'},
{'song': 'The Story of Us',
'accuracy': 81.29432624,
'daily_counts': 222759,
'historical_counts': 286.295937,
'top_lyric': 'Next chapter',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.43,
'lyrical_play_count': 25,
'album': 'Speak Now'},
{'song': 'it’s time to go',
'accuracy': 81.11824015,
'daily_counts': 119289,
'historical_counts': 101.727406,
'top_lyric': 'Sometimes walking out is the one thing',
'lyrical_accuracy': 96.77,
'lyrical_speed': 4.06,
'lyrical_play_count': 31,
'album': 'evermore'},
{'song': 'ivy',
'accuracy': 81.07556161,
'daily_counts': 209176,
'historical_counts': 205.279903,
'top_lyric': 'Stop you putting roots in my dreamland',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.86,
'lyrical_play_count': 34,
'album': 'evermore'},
{'song': 'I Knew You Were Trouble',
'accuracy': 80.55925433,
'daily_counts': 504820,
'historical_counts': 316.199313,
'top_lyric': 'Or her, or anyone, or anything',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.62,
'lyrical_play_count': 24,
'album': 'Red'},
{'song': 'Stay Stay Stay',
'accuracy': 80.47138047,
'daily_counts': 80085,
'historical_counts': 140.96475,
'top_lyric': "I'm pretty sure we almost broke up last night",
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.99,
'lyrical_play_count': 31,
'album': 'Red'},
{'song': 'Call It What You Want',
'accuracy': 80.43193717,
'daily_counts': 355135,
'historical_counts': 379.200101,
'top_lyric': "I want to wear his initial on a chain 'round my neck",
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.86,
'lyrical_play_count': 34,
'album': 'reputation'},
{'song': 'King of My Heart',
'accuracy': 80.32909499,
'daily_counts': 244559,
'historical_counts': 253.103078,
'top_lyric': "And all at once, you're all I want, I'll never let you go",
'lyrical_accuracy': 92.59,
'lyrical_speed': 3.84,
'lyrical_play_count': 81,
'album': 'reputation'},
{'song': 'The Best Day',
'accuracy': 80.26315789,
'daily_counts': 63393,
'historical_counts': 88.11654,
'top_lyric': "I'm five years old, it's getting cold, I've got my big coat on",
'lyrical_accuracy': 97.06,
'lyrical_speed': 3.82,
'lyrical_play_count': 34,
'album': 'Fearless'},
{'song': 'The Lucky One',
'accuracy': 80.18018018,
'daily_counts': 70736,
'historical_counts': 116.34419,
'top_lyric': 'And the camera flashes make it look like a dream',
'lyrical_accuracy': 96.0,
'lyrical_speed': 4.12,
'lyrical_play_count': 25,
'album': 'Red'},
{'song': 'Teardrops On My Guitar',
'accuracy': 80.16431925,
'daily_counts': 161649,
'historical_counts': 251.613542,
'top_lyric': 'Drew looks at me',
'lyrical_accuracy': 95.45,
'lyrical_speed': 2.56,
'lyrical_play_count': 22,
'album': 'Taylor Swift'},
{'song': 'Fearless',
'accuracy': 79.85989492,
'daily_counts': 588977,
'historical_counts': 377.391464,
'top_lyric': "Cause I don't know how it gets better than this",
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.55,
'lyrical_play_count': 44,
'album': 'Fearless'},
{'song': 'peace',
'accuracy': 79.59413754,
'daily_counts': 193013,
'historical_counts': 206.628763,
'top_lyric': "The devil's in the details, but you got a friend in me",
'lyrical_accuracy': 90.0,
'lyrical_speed': 4.6,
'lyrical_play_count': 40,
'album': 'folklore'},
{'song': 'Girl at Home',
'accuracy': 79.49080622,
'daily_counts': 54651,
'historical_counts': 78.130065,
'top_lyric': "You're about to lose your girl",
'lyrical_accuracy': 96.43,
'lyrical_speed': 4.24,
'lyrical_play_count': 28,
'album': 'Red'},
{'song': 'Message In A Bottle',
'accuracy': 79.3220339,
'daily_counts': 145713,
'historical_counts': 200.359575,
'top_lyric': "Standin' here, hopin' it gets to you (It gets to you)",
'lyrical_accuracy': 95.83,
'lyrical_speed': 3.25,
'lyrical_play_count': 48,
'album': 'Red'},
{'song': 'Mary’s Song',
'accuracy': 79.23211169,
'daily_counts': 39645,
'historical_counts': 43.043203,
'top_lyric': 'Growing up and falling in love and our mamas smiled',
'lyrical_accuracy': 96.97,
'lyrical_speed': 3.05,
'lyrical_play_count': 33,
'album': 'Taylor Swift'},
{'song': 'I Forgot That You Existed',
'accuracy': 78.89009793,
'daily_counts': 197323,
'historical_counts': 323.701936,
'top_lyric': "It isn't love, it isn't hate, it's just indifference",
'lyrical_accuracy': 97.26,
'lyrical_speed': 3.0,
'lyrical_play_count': 73,
'album': 'Lover'},
{'song': 'Begin Again',
'accuracy': 78.88198758,
'daily_counts': 140175,
'historical_counts': 220.317496,
'top_lyric': "He didn't like it when I wore high heels, but I do",
'lyrical_accuracy': 93.33,
'lyrical_speed': 4.08,
'lyrical_play_count': 30,
'album': 'Red'},
{'song': 'Hey Stephen',
'accuracy': 78.64197531,
'daily_counts': 98041,
'historical_counts': 132.327534,
'top_lyric': "Can't help it if I wanna kiss you in the rain so",
'lyrical_accuracy': 95.92,
'lyrical_speed': 4.35,
'lyrical_play_count': 49,
'album': 'Fearless'},
{'song': 'Dancing with Our Hands Tied',
'accuracy': 78.5770751,
'daily_counts': 230086,
'historical_counts': 236.075654,
'top_lyric': "Could've spent forever with your hands in my pockets",
'lyrical_accuracy': 95.56,
'lyrical_speed': 3.88,
'lyrical_play_count': 45,
'album': 'reputation'},
{'song': 'cowboy like me',
'accuracy': 78.5660941,
'daily_counts': 188818,
'historical_counts': 174.859421,
'top_lyric': "You're a bandit like me",
'lyrical_accuracy': 93.75,
'lyrical_speed': 2.35,
'lyrical_play_count': 32,
'album': 'evermore'},
{'song': 'Bad Blood',
'accuracy': 78.5472973,
'daily_counts': 846681,
'historical_counts': 875.1421,
'top_lyric': 'If you live like that, you live with ghosts',
'lyrical_accuracy': 97.62,
'lyrical_speed': 3.67,
'lyrical_play_count': 42,
'album': '1989'},
{'song': 'The Way I Loved You',
'accuracy': 78.53717026,
'daily_counts': 412971,
'historical_counts': 455.196103,
'top_lyric': 'He respects my space',
'lyrical_accuracy': 95.65,
'lyrical_speed': 3.84,
'lyrical_play_count': 23,
'album': 'Fearless'},
{'song': 'Soon You’ll Get Better',
'accuracy': 78.45659164,
'daily_counts': 100421,
'historical_counts': 137.806474,
'top_lyric': "In doctor's office lighting, I didn't tell you I was scared",
'lyrical_accuracy': 93.75,
'lyrical_speed': 3.5,
'lyrical_play_count': 32,
'album': 'Lover'},
{'song': 'All You Had to Do Was Stay',
'accuracy': 78.17817818,
'daily_counts': 320921,
'historical_counts': 297.184562,
'top_lyric': '(Stay) Hey, now you say you want it back',
'lyrical_accuracy': 96.67,
'lyrical_speed': 4.65,
'lyrical_play_count': 30,
'album': '1989'},
{'song': 'Maroon',
'accuracy': 78.13911472,
'daily_counts': 392364,
'historical_counts': 430.030824,
'top_lyric': 'So scarlet, it was',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.25,
'lyrical_play_count': 43,
'album': 'Midnights'},
{'song': 'Mine',
'accuracy': 78.0141844,
'daily_counts': 426880,
'historical_counts': 428.111386,
'top_lyric': "You say we'll never make my parents' mistakes",
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.15,
'lyrical_play_count': 29,
'album': 'Speak Now'},
{'song': 'Wonderland',
'accuracy': 77.91932059,
'daily_counts': 225728,
'historical_counts': 207.141933,
'top_lyric': 'You and I got lost in it',
'lyrical_accuracy': 93.14,
'lyrical_speed': 3.26,
'lyrical_play_count': 102,
'album': '1989'},
{'song': 'Midnight Rain',
'accuracy': 77.64578834,
'daily_counts': 653679,
'historical_counts': 612.748183,
'top_lyric': 'He wanted a bride, I was making my own name',
'lyrical_accuracy': 96.55,
'lyrical_speed': 2.79,
'lyrical_play_count': 29,
'album': 'Midnights'},
{'song': "Should've Said No",
'accuracy': 77.61627907,
'daily_counts': 96385,
'historical_counts': 127.263654,
'top_lyric': 'Was she worth this?',
'lyrical_accuracy': 94.29,
'lyrical_speed': 3.03,
'lyrical_play_count': 35,
'album': 'Taylor Swift'},
{'song': 'Electric Touch',
'accuracy': 77.5862069,
'daily_counts': 138485,
'historical_counts': 75.583639,
'top_lyric': 'Just one time, just one time',
'lyrical_accuracy': 95.35,
'lyrical_speed': 3.18,
'lyrical_play_count': 43,
'album': 'Speak Now'},
{'song': 'Treacherous',
'accuracy': 77.4559194,
'daily_counts': 99283,
'historical_counts': 175.452328,
'top_lyric': 'This path is reckless',
'lyrical_accuracy': 95.65,
'lyrical_speed': 3.76,
'lyrical_play_count': 23,
'album': 'Red'},
{'song': 'hoax',
'accuracy': 77.44932432,
'daily_counts': 171096,
'historical_counts': 186.632672,
'top_lyric': 'My broken drum',
'lyrical_accuracy': 91.67,
'lyrical_speed': 3.05,
'lyrical_play_count': 36,
'album': 'folklore'},
{'song': 'Dress',
'accuracy': 77.43772242,
'daily_counts': 432344,
'historical_counts': 300.282921,
'top_lyric': 'Take it off, ha, ha, ha-ah',
'lyrical_accuracy': 96.34,
'lyrical_speed': 3.05,
'lyrical_play_count': 82,
'album': 'reputation'},
{'song': 'Sad Beautiful Tragic',
'accuracy': 77.36263736,
'daily_counts': 99141,
'historical_counts': 129.888884,
'top_lyric': 'Distance, timing, breakdown, fighting',
'lyrical_accuracy': 96.0,
'lyrical_speed': 4.63,
'lyrical_play_count': 25,
'album': 'Red'},
{'song': 'You’re Not Sorry',
'accuracy': 77.20930233,
'daily_counts': 91173,
'historical_counts': 113.467359,
'top_lyric': "And you can tell me that you're sorry",
'lyrical_accuracy': 92.31,
'lyrical_speed': 3.86,
'lyrical_play_count': 26,
'album': 'Fearless'},
{'song': 'Sweet Nothing',
'accuracy': 77.09611452,
'daily_counts': 251738,
'historical_counts': 257.572927,
'top_lyric': 'To you, I can admit that I’m just too soft for all of it',
'lyrical_accuracy': 92.11,
'lyrical_speed': 3.73,
'lyrical_play_count': 38,
'album': 'Midnights'},
{'song': 'Tim McGraw',
'accuracy': 76.93965517,
'daily_counts': 97311,
'historical_counts': 124.268597,
'top_lyric': 'Put those Georgia stars to shame that night',
'lyrical_accuracy': 94.29,
'lyrical_speed': 2.8,
'lyrical_play_count': 35,
'album': 'Taylor Swift'},
{'song': 'White Horse',
'accuracy': 76.86746988,
'daily_counts': 166798,
'historical_counts': 199.478097,
'top_lyric': "I'm not the one you'll sweep off her feet, lead her up the stairwell",
'lyrical_accuracy': 95.83,
'lyrical_speed': 4.54,
'lyrical_play_count': 24,
'album': 'Fearless'},
{'song': 'I Think He Knows',
'accuracy': 76.84859155,
'daily_counts': 219937,
'historical_counts': 259.713692,
'top_lyric': 'He got that boyish look that I like in a man',
'lyrical_accuracy': 96.3,
'lyrical_speed': 3.28,
'lyrical_play_count': 27,
'album': 'Lover'},
{'song': 'I Wish You Would',
'accuracy': 76.71232877,
'daily_counts': 282427,
'historical_counts': 220.552422,
'top_lyric': 'I miss you too much to be mad anymore, and I',
'lyrical_accuracy': 92.31,
'lyrical_speed': 4.63,
'lyrical_play_count': 39,
'album': '1989'},
{'song': 'Innocent',
'accuracy': 76.63656885,
'daily_counts': 80687,
'historical_counts': 93.366524,
'top_lyric': "Oh, who you are is not where you've been",
'lyrical_accuracy': 95.83,
'lyrical_speed': 3.61,
'lyrical_play_count': 24,
'album': 'Speak Now'},
{'song': 'Ours',
'accuracy': 76.6297663,
'daily_counts': 116393,
'historical_counts': 124.929243,
'top_lyric': 'People throw rocks at things that shine',
'lyrical_accuracy': 96.15,
'lyrical_speed': 3.5,
'lyrical_play_count': 26,
'album': 'Speak Now'},
{'song': 'You All Over Me',
'accuracy': 76.4516129,
'daily_counts': 72178,
'historical_counts': 106.98879,
'top_lyric': "You know, you can scratch it right off, it's how it used to be",
'lyrical_accuracy': 90.48,
'lyrical_speed': 4.6,
'lyrical_play_count': 21,
'album': 'Fearless'},
{'song': 'Question...?',
'accuracy': 76.41369048,
'daily_counts': 205251,
'historical_counts': 283.66167,
'top_lyric': 'Did you ever have someone kiss you in a crowded room',
'lyrical_accuracy': 94.92,
'lyrical_speed': 2.79,
'lyrical_play_count': 59,
'album': 'Midnights'},
{'song': 'Don’t Blame Me',
'accuracy': 76.36239782,
'daily_counts': 1429039,
'historical_counts': 1024.728132,
'top_lyric': 'My drug is my baby',
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.79,
'lyrical_play_count': 55,
'album': 'reputation'},
{'song': 'dorothea',
'accuracy': 76.28705148,
'daily_counts': 150828,
'historical_counts': 163.520077,
'top_lyric': "Ooh, you'rе a queen sellin' dreams, sellin' makeup and magazines",
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.6,
'lyrical_play_count': 32,
'album': 'evermore'},
{'song': 'Hits Different',
'accuracy': 76.17021277,
'daily_counts': 310886,
'historical_counts': 167.630713,
'top_lyric': 'Shit my friends say to get me by',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.57,
'lyrical_play_count': 37,
'album': 'Midnights'},
{'song': 'Daylight',
'accuracy': 75.97998332,
'daily_counts': 634557,
'historical_counts': 376.083494,
'top_lyric': "But it's golden (Golden)",
'lyrical_accuracy': 98.39,
'lyrical_speed': 2.74,
'lyrical_play_count': 62,
'album': 'Lover'},
{'song': 'The Very First Night',
'accuracy': 75.95307918,
'daily_counts': 176501,
'historical_counts': 161.648043,
'top_lyric': 'Take me away (Take me) to you, to you',
'lyrical_accuracy': 78.05,
'lyrical_speed': 4.37,
'lyrical_play_count': 41,
'album': 'Red'},
{'song': 'happiness',
'accuracy': 75.92982456,
'daily_counts': 154469,
'historical_counts': 175.935158,
'top_lyric': 'All you want from me now is the green light of forgiveness',
'lyrical_accuracy': 96.43,
'lyrical_speed': 3.86,
'lyrical_play_count': 28,
'album': 'evermore'},
{'song': 'Dear Reader',
'accuracy': 75.68756876,
'daily_counts': 147365,
'historical_counts': 119.089264,
'top_lyric': "You wouldn't take my word for it if you knew who was talking",
'lyrical_accuracy': 94.59,
'lyrical_speed': 4.71,
'lyrical_play_count': 37,
'album': 'Midnights'},
{'song': 'Holy Ground',
'accuracy': 75.50143266,
'daily_counts': 94748,
'historical_counts': 135.145628,
'top_lyric': 'And I guess we fell apart in the usual way',
'lyrical_accuracy': 92.0,
'lyrical_speed': 3.63,
'lyrical_play_count': 25,
'album': 'Red'},
{'song': 'Snow On The Beach',
'accuracy': 75.46666667,
'daily_counts': 593289,
'historical_counts': 573.54971,
'top_lyric': "Weird, but fuckin' beautiful",
'lyrical_accuracy': 100.0,
'lyrical_speed': 2.52,
'lyrical_play_count': 35,
'album': 'Midnights'},
{'song': 'It’s Nice to Have a Friend',
'accuracy': 75.24752475,
'daily_counts': 99647,
'historical_counts': 125.540815,
'top_lyric': 'School bell rings, walk me home',
'lyrical_accuracy': 89.66,
'lyrical_speed': 3.1,
'lyrical_play_count': 29,
'album': 'Lover'},
{'song': 'End Game',
'accuracy': 75.11715089,
'daily_counts': 338312,
'historical_counts': 475.395652,
'top_lyric': 'Big reputation, big reputation',
'lyrical_accuracy': 97.8,
'lyrical_speed': 3.35,
'lyrical_play_count': 91,
'album': 'reputation'},
{'song': 'A Place In This World',
'accuracy': 74.95495495,
'daily_counts': 37258,
'historical_counts': 39.477757,
'top_lyric': "Maybe I'm just a girl on a mission",
'lyrical_accuracy': 93.55,
'lyrical_speed': 3.33,
'lyrical_play_count': 31,
'album': 'Taylor Swift'},
{'song': 'I Almost Do',
'accuracy': 74.81617647,
'daily_counts': 88208,
'historical_counts': 148.520405,
'top_lyric': 'It takes everything in me not to call you',
'lyrical_accuracy': 88.24,
'lyrical_speed': 4.43,
'lyrical_play_count': 34,
'album': 'Red'},
{'song': 'Sparks Fly',
'accuracy': 74.7957993,
'daily_counts': 296594,
'historical_counts': 291.913891,
'top_lyric': 'I run my fingers through your hair and watch the lights go wild',
'lyrical_accuracy': 93.55,
'lyrical_speed': 3.95,
'lyrical_play_count': 31,
'album': 'Speak Now'},
{'song': 'I’m Only Me When I’m with You',
'accuracy': 74.77707006,
'daily_counts': 42776,
'historical_counts': 48.551983,
'top_lyric': "When I'm with anybody else",
'lyrical_accuracy': 92.5,
'lyrical_speed': 4.3,
'lyrical_play_count': 40,
'album': 'Taylor Swift'},
{'song': 'Starlight',
'accuracy': 74.60567823,
'daily_counts': 75934,
'historical_counts': 109.720986,
'top_lyric': 'It was the best night, never would forget how we moved',
'lyrical_accuracy': 91.3,
'lyrical_speed': 4.15,
'lyrical_play_count': 23,
'album': 'Red'},
{'song': 'The Moment I Knew',
'accuracy': 74.38596491,
'daily_counts': 68347,
'historical_counts': 98.73702,
'top_lyric': 'And the sinking feeling starts',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.97,
'lyrical_play_count': 23,
'album': 'Red'},
{'song': 'Everything Has Changed',
'accuracy': 74.37908497,
'daily_counts': 237162,
'historical_counts': 408.928018,
'top_lyric': 'All I knew this morning when I woke',
'lyrical_accuracy': 96.15,
'lyrical_speed': 4.15,
'lyrical_play_count': 26,
'album': 'Red'},
{'song': 'long story short',
'accuracy': 73.36834209,
'daily_counts': 184930,
'historical_counts': 185.028816,
'top_lyric': 'Pushed from the precipice',
'lyrical_accuracy': 96.77,
'lyrical_speed': 3.32,
'lyrical_play_count': 31,
'album': 'evermore'},
{'song': 'Haunted',
'accuracy': 73.20341048,
'daily_counts': 192455,
'historical_counts': 198.547057,
'top_lyric': "Come on, come on, don't leave me like this",
'lyrical_accuracy': 96.97,
'lyrical_speed': 3.0,
'lyrical_play_count': 33,
'album': 'Speak Now'},
{'song': 'Forever & Always',
'accuracy': 73.20261438,
'daily_counts': 189830,
'historical_counts': 232.543556,
'top_lyric': "It rains when you're here and it rains when you're gone",
'lyrical_accuracy': 93.55,
'lyrical_speed': 3.92,
'lyrical_play_count': 31,
'album': 'Fearless'},
{'song': 'Jump Then Fall',
'accuracy': 73.14629259,
'daily_counts': 66204,
'historical_counts': 77.682084,
'top_lyric': "Don't be afraid to",
'lyrical_accuracy': 93.55,
'lyrical_speed': 3.53,
'lyrical_play_count': 31,
'album': 'Fearless'},
{'song': 'Afterglow',
'accuracy': 73.04964539,
'daily_counts': 384956,
'historical_counts': 357.329649,
'top_lyric': "Hey, it's all me, in my head",
'lyrical_accuracy': 94.44,
'lyrical_speed': 4.4,
'lyrical_play_count': 36,
'album': 'Lover'},
{'song': 'If This Was a Movie',
'accuracy': 72.82608696,
'daily_counts': 98269,
'historical_counts': 103.924209,
'top_lyric': 'Cause nothing like this ever happened to them',
'lyrical_accuracy': 96.3,
'lyrical_speed': 4.84,
'lyrical_play_count': 27,
'album': 'Speak Now'},
{'song': 'A Perfectly Good Heart',
'accuracy': 72.57019438,
'daily_counts': 23820,
'historical_counts': 24.448486,
'top_lyric': 'Why would you wanna break',
'lyrical_accuracy': 89.41,
'lyrical_speed': 3.2,
'lyrical_play_count': 85,
'album': 'Taylor Swift'},
{'song': 'Last Kiss',
'accuracy': 72.5,
'daily_counts': 178837,
'historical_counts': 194.694671,
'top_lyric': 'Just like our last',
'lyrical_accuracy': 96.77,
'lyrical_speed': 2.82,
'lyrical_play_count': 31,
'album': 'Speak Now'},
{'song': 'Come Back... Be Here',
'accuracy': 72.3880597,
'daily_counts': 126414,
'historical_counts': 146.444321,
'top_lyric': 'In New York, be here',
'lyrical_accuracy': 97.3,
'lyrical_speed': 3.22,
'lyrical_play_count': 37,
'album': 'Red'},
{'song': 'evermore',
'accuracy': 72.20267417,
'daily_counts': 207050,
'historical_counts': 201.903927,
'top_lyric': 'Gray November',
'lyrical_accuracy': 90.63,
'lyrical_speed': 2.79,
'lyrical_play_count': 32,
'album': 'evermore'},
{'song': 'So It Goes...',
'accuracy': 72.1642764,
'daily_counts': 170142,
'historical_counts': 171.067755,
'top_lyric': "You know I'm not a bad girl, but I",
'lyrical_accuracy': 88.0,
'lyrical_speed': 4.42,
'lyrical_play_count': 50,
'album': 'reputation'},
{'song': 'Cold as You',
'accuracy': 71.84300341,
'daily_counts': 38277,
'historical_counts': 40.861638,
'top_lyric': 'You put up walls and paint them all a shade of gray',
'lyrical_accuracy': 91.3,
'lyrical_speed': 6.01,
'lyrical_play_count': 23,
'album': 'Taylor Swift'},
{'song': 'Bye Bye Baby',
'accuracy': 71.59090909,
'daily_counts': 53557,
'historical_counts': 52.37743,
'top_lyric': 'Bye bye to everything I thought was on my side',
'lyrical_accuracy': 100.0,
'lyrical_speed': 3.7,
'lyrical_play_count': 14,
'album': 'Fearless'},
{'song': 'Change',
'accuracy': 71.11681643,
'daily_counts': 50221,
'historical_counts': 68.624045,
'top_lyric': "It's a revolution, throw your hands up",
'lyrical_accuracy': 91.67,
'lyrical_speed': 4.88,
'lyrical_play_count': 24,
'album': 'Fearless'},
{'song': 'Tell Me Why',
'accuracy': 70.62211982,
'daily_counts': 66955,
'historical_counts': 84.836974,
'top_lyric': 'You tell me that you love me, then cut me down',
'lyrical_accuracy': 90.32,
'lyrical_speed': 4.9,
'lyrical_play_count': 31,
'album': 'Fearless'},
{'song': 'Superman',
'accuracy': 70.61946903,
'daily_counts': 66989,
'historical_counts': 60.867381,
'top_lyric': "Go save the world, I'll be around",
'lyrical_accuracy': 96.77,
'lyrical_speed': 2.62,
'lyrical_play_count': 31,
'album': 'Speak Now'},
{'song': 'The Other Side of the Door',
'accuracy': 70.26239067,
'daily_counts': 85428,
'historical_counts': 81.717686,
'top_lyric': 'With your face and the beautiful eyes',
'lyrical_accuracy': 87.1,
'lyrical_speed': 4.67,
'lyrical_play_count': 31,
'album': 'Fearless'},
{'song': 'Tied Together With A Smile',
'accuracy': 70.02096436,
'daily_counts': 30916,
'historical_counts': 31.786988,
'top_lyric': 'But he leaves you out like a penny in the rain',
'lyrical_accuracy': 90.91,
'lyrical_speed': 4.54,
'lyrical_play_count': 22,
'album': 'Taylor Swift'},
{'song': 'Labyrinth',
'accuracy': 69.98394864,
'daily_counts': 271441,
'historical_counts': 255.740743,
'top_lyric': "Uh-oh, I'm fallin' in love",
'lyrical_accuracy': 91.3,
'lyrical_speed': 3.01,
'lyrical_play_count': 92,
'album': 'Midnights'},
{'song': 'That’s When',
'accuracy': 69.23076923,
'daily_counts': 69836,
'historical_counts': 74.250184,
'top_lyric': "Laughing, when I'm crying",
'lyrical_accuracy': 80.0,
'lyrical_speed': 3.65,
'lyrical_play_count': 25,
'album': 'Fearless'},
{'song': 'This Love',
'accuracy': 68.90380313,
'daily_counts': 350170,
'historical_counts': 336.233263,
'top_lyric': 'In silent screams and wildest dreams',
'lyrical_accuracy': 96.88,
'lyrical_speed': 4.21,
'lyrical_play_count': 32,
'album': '1989'},
{'song': 'Stay Beautiful',
'accuracy': 68.83116883,
'daily_counts': 29790,
'historical_counts': 33.317251,
'top_lyric': 'Cory finds another way to be',
'lyrical_accuracy': 87.5,
'lyrical_speed': 3.69,
'lyrical_play_count': 24,
'album': 'Taylor Swift'},
{'song': 'Come In With the Rain',
'accuracy': 68.78504673,
'daily_counts': 45659,
'historical_counts': 54.813332,
'top_lyric': "I'll leave my window open",
'lyrical_accuracy': 92.59,
'lyrical_speed': 3.57,
'lyrical_play_count': 27,
'album': 'Fearless'},
{'song': 'Untouchable',
'accuracy': 68.46846847,
'daily_counts': 71543,
'historical_counts': 75.598667,
'top_lyric': 'You got to come on, come on, oh',
'lyrical_accuracy': 88.89,
'lyrical_speed': 5.35,
'lyrical_play_count': 45,
'album': 'Fearless'},
{'song': 'Breathe',
'accuracy': 67.73722628,
'daily_counts': 77406,
'historical_counts': 130.251729,
'top_lyric': "And I can't breathe without you, but I have to",
'lyrical_accuracy': 88.33,
'lyrical_speed': 3.59,
'lyrical_play_count': 60,
'album': 'Fearless'},
{'song': 'Today Was a Fairytale',
'accuracy': 67.27549467,
'daily_counts': 64127,
'historical_counts': 81.153844,
'top_lyric': 'You were the prince',
'lyrical_accuracy': 90.91,
'lyrical_speed': 5.46,
'lyrical_play_count': 33,
'album': 'Fearless'},
{'song': 'Superstar',
'accuracy': 66.77115987,
'daily_counts': 39661,
'historical_counts': 48.038335,
'top_lyric': 'You played in bars, you play guitar',
'lyrical_accuracy': 90.0,
'lyrical_speed': 3.82,
'lyrical_play_count': 30,
'album': 'Fearless'},
{'song': 'Don’t You',
'accuracy': 65.55555556,
'daily_counts': 70536,
'historical_counts': 66.6611,
'top_lyric': "You don't know how much I feel I love you still",
'lyrical_accuracy': 82.61,
'lyrical_speed': 6.34,
'lyrical_play_count': 23,
'album': 'Fearless'},
{'song': 'Run',
'accuracy': 62.06896552,
'daily_counts': 82536,
'historical_counts': 132.988742,
'top_lyric': "Give me the keys, I'll bring the car back around",
'lyrical_accuracy': 87.5,
'lyrical_speed': 4.18,
'lyrical_play_count': 16,
'album': 'Red'},
{'song': 'The Outside',
'accuracy': 60.14362657,
'daily_counts': 32047,
'historical_counts': 28.461623,
'top_lyric': 'Nobody ever lets me in',
'lyrical_accuracy': 84.62,
'lyrical_speed': 3.64,
'lyrical_play_count': 39,
'album': 'Taylor Swift'},
{'song': 'Invisible',
'accuracy': 60.04756243,
'daily_counts': 29572,
'historical_counts': 33.388149,
'top_lyric': 'And you just see right through me',
'lyrical_accuracy': 78.57,
'lyrical_speed': 5.4,
'lyrical_play_count': 70,
'album': 'Taylor Swift'},
{'song': 'The Last Time',
'accuracy': 57.20720721,
'daily_counts': 124710,
'historical_counts': 170.894243,
'top_lyric': 'Find myself at your door',
'lyrical_accuracy': 88.46,
'lyrical_speed': 4.08,
'lyrical_play_count': 26,
'album': 'Red'}]

function Dataland() {	

	// const accuracy_filter = 95;  // for the initial view, have min 95 accuracy;
	// const ltErasColors = ['eras_green', 'eras_gold', 'eras_purple', 'eras_lblue', 'eras_pink', 'eras_maroon', 'eras_indigo', 'eras_tan', 'eras_grey', 'eras_black'];

	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights'} as const

	const albumKeyLkup = { "Taylor Swift" : "Taylor_Swift", "Fearless" : "Fearless", "Speak Now" : "Speak_Now", 'Red' : 'Red', '1989' : '1989', 'reputation' : 'reputation', 'Lover' : 'Lover', 'folklore' : 'folklore', 'evermore' : 'evermore', 'Midnights' : 'Midnights'} as const

	const albumCovers = ["imtheproblem", "Taylor_Swift", "Fearless", "Speak_Now", "Red", "1989", "reputation", "Lover", "folklore", "evermore", "Midnights"] as const
	
	const scrollRef = useRef<HTMLInputElement | null>(null)
	const spotifyRef = useRef<HTMLInputElement | null>(null)
	const top40Ref = useRef<HTMLInputElement | null>(null)
	const cultFailRef = useRef<HTMLInputElement | null>(null)
	const newSongRef = useRef<HTMLInputElement | null>(null)

	const [fighter, setFighter] = useState<AlbumArt>('imtheproblem')
	
	const [albumFilter, setAlbumFilter] = useState<AlbumArt>('imtheproblem')
	const [songFilter, setSongFilter] = useState<string>('')
	const [displayLyrics, setDisplayLyrics] = useState<LyricData[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const [songList, setSongList] = useState<SongList[]>([])
	const [gettingLyrics, setGettingLyrics] = useState<boolean>(false)
	const [top40, setTop40] = useState<LyricData[]>([])
	const [showTop40, setShowTop40] = useState<boolean>(true)
	const [genViz, setGenViz] = useState<boolean>(false)  // show spotify viz 
	const [spotifyData, setSpotifyData] = useState<SpotifyData[]>(spotify_full_data)
	const screenSize = useScreenSize()


	function formatBigNumber(num: number) {
		// already in millions 
		if(num < 1000){
				return (num).toFixed(1) + 'M'; // convert to K for number from > 1000 < 1 million 
		} else if(num > 1000){
			return (num/1000).toFixed(1) + 'Bn'; // convert to M for number from > 1 B 
		}
	}

	useEffect(() => {

		delayedDataFetch()
	
	}, [])

	// useEffect(() => {
	// 	window.addEventListener('scroll')
	// 	if (!genViz){

	// 	}
	// }, [])

	useEffect(()=> {
		if (genViz){

			d3.selectAll('.spotify').remove()
			// spotify - accuracy scatter plot
			const t = d3.transition()
				.duration(1500)
				.delay((_, i) => i * 500)
				.ease(d3.easeBounceOut);		

			const h = screenSize.width > 420 ? 680 : 460
			const w = screenSize.width > 420 ? 600 : 420
			const fontSize = screenSize.width > 420 ? '20px' : '18px'
			const margin = 30
			const marginBottom = 45
			const marginTop = 36
			const marginLeft = 60
			const marginRight = 15
			
			let yScale = d3.scaleLinear().domain([Math.max(...spotifyData.map(x=> x.historical_counts)), Math.min(...spotifyData.map(x=> x.historical_counts))]).range([marginTop, h - marginBottom])

			let xScale = d3.scaleLinear().domain([Math.min(...spotifyData.map(x=> x.accuracy)), Math.max(...spotifyData.map(x=> x.accuracy))]).range([marginLeft, w - marginRight])

			let xInvScale = d3.scaleLinear().domain([marginLeft, w - marginRight]).range([Math.min(...spotifyData.map(x=> x.accuracy)), 100])					
					
			let yInvScale = d3.scaleLinear().domain([marginTop, h - marginBottom]).range([Math.max(...spotifyData.map(x=> x.historical_counts)), Math.min(...spotifyData.map(x=> x.historical_counts))])
		
			// const extent = [[marginLeft, marginTop], [w - marginRight, h - marginTop]];
			
			// const zoom = d3.zoom()
			// .scaleExtent([1, 8])
			// .translateExtent(extent)
			// .extent(extent)
			// .on("zoom", zoomed);
		

			let scatter = d3.select("#spotifyscatter").append('svg')
				.attr('class', 'spotify')
				.attr('height', h)
				.attr('width', w)
				.attr("viewBox", `0 0 ${h} ${w}`)
				// .call(zoom)
			
			const brush = d3.brush().on("end", ({selection}) => {
				if (selection) {
					const [[x0, y0], [x1, y1]] = selection;			
					// console.log(selection)					

					let selectedData = spotify_full_data.filter(x=> x.accuracy >= xInvScale(x0) && x.accuracy <= xInvScale(x1) && x.historical_counts <= yInvScale(y0) && x.historical_counts >= yInvScale(y1))

					if (selectedData.length > 0) {
						// // y1 is further up (larger than y0)
						setSpotifyData(spotify_full_data.filter(x=> x.accuracy >= xInvScale(x0) && x.accuracy <= xInvScale(x1) && x.historical_counts <= yInvScale(y0) && x.historical_counts >= yInvScale(y1)))
					}
					
					
				}
			})
			.extent([[marginLeft-10,0], [w, h-marginBottom + 10]])  // overlay sizing

			//!!!! must create brush before appending bc it overlays a rect that will block mouseover events
			scatter.append('g').attr('class', 'brush')
				.call(brush)
				.on("dblclick", function() {
					setSpotifyData(spotify_full_data)})		

			let spotify = scatter.selectAll<SVGRectElement, SpotifyData>('circle').data(spotifyData, function(d: SpotifyData) {
				return d.song
			})

			// let tooltip = scatter.append("div")	
			// .attr("class", "tooltip")				
			// .style("opacity", 0);
			
			// cant seem to get transitions to work with mouseover with joins...so using enter.append			
			spotify.enter().append('circle')
				.attr('class', function(d) { return `${albumColorKey[albumKeyLkup[d.album as keyof typeof albumKeyLkup] as keyof typeof albumColorKey]}`
				})									
				.on('mouseover', function(_, d) {
					// console.log(d3.pointer(e))
					// const startY = d3.pointer(e)[1] - 10//40
					// const xPos = d3.pointer(e)[0] //60

					const startY = -30
					const xPos = screenSize.width < 420 ? 20 : 60		
					
					d3.select('.spotify').append('text')
					.attr('class', 'hoverlabel')
					.attr('x', xPos)
					.attr('y', startY)
					.attr('font-size', fontSize)
					.html(`${d.song}: ${(d.accuracy).toFixed(1)}% | ${formatBigNumber(d.historical_counts)} Spotify Plays`)

					d3.select('.spotify').append('text')
					.attr('class', 'hoverlabel')
					.attr('x', xPos)
					.attr('y', startY + 25)
					.attr('font-size', fontSize)
					.text(`${d.top_lyric}`)

					d3.select('.spotify').append('text')
					.attr('class', 'hoverlabel')
					.attr('x', xPos)
					.attr('y', startY + 50)
					.attr('font-size', fontSize)
					.text(`Top Line Avg Stats: ${d.lyrical_accuracy}% | ${d.lyrical_speed}s`)

				})
				.on('mouseout', function(){
					d3.selectAll('.hoverlabel').remove()
				})				
				.attr('cx', 0)  // make bounce look like spray bottle 
				.attr('cy', h)
				.transition(t)
				.attr('r', '6')				
				.attr('cy', function(d){					
					return yScale(d.historical_counts)
				})
				.attr('cx', function(d){					
					return xScale(d.accuracy)
				})
			
			// const xAxisGen = (g, x) => g.call(d3.axisBottom(xScale))
			// 	.call(g1 => g1.append('text')
			// 		.attr('y', 27)
			// 		.attr('x', w/2)
			// 		.attr('font-size', '12px')
			// 		.style('fill', 'black')  // fill defaults to none w/axis generator 
			// 		.text('Accuracy'))

			d3.select('.spotify').append('g')
				.attr('class', 'spotify-xaxis')
				.attr('transform', `translate(0, ${h - margin})`)
				// .call(xAxisGen, xScale)				
				.call(d3.axisBottom(xScale))
				.call(g=> g.append('text')
					.attr('y', 27)
					.attr('x', w/2)
					.attr('font-size', '12px')
					.style('fill', 'black')  // fill defaults to none w/axis generator 
					.text('Accuracy'))
				
			// const f = d3.format('.0M');

			//y axis 
			d3.select('.spotify').append('g')
				.attr('class', 'spotify-yaxis')
				.attr('transform', `translate(${1.7*margin}, 0)`)			
				.call(d3.axisLeft(yScale))
				.call(g=> g.append('text')
					.attr('y', h/2)
					.attr('x', -37)
					.attr("text-anchor", "middle")
					.attr('font-size', '12px')
					.style('fill', 'black')
					.attr('transform-origin', `-37 ${h/2}`)
					.attr('transform', 'rotate(-90)')
					.text('Historical Spotify Plays (Millions)')
				)				
		
		
			// function zoomed(event) {
			// 	console.log(event)
			// 	const xz = event.transform.rescaleX(xScale);
			// 	console.log(xz)
			// 	// path.attr("d", area(data, xz));
			// 	xAxis.call(xAxisGen, xz);
			// }
				
			
		}			
	}, [spotifyData, genViz])  
	// use effect doesnt run w/data viz if i put a state value that doesn't change in the dep array

	useEffect(()=> {

		// get lyrical stats data either from db or from array we already have
		if (fighter == 'imtheproblem'){
			setShowTop40(true)
		} else {
			// dont have data for particular album, pull from db
			if (fullLyricsNStats.filter(x=> x.album_key == fighter).length == 0){

				setGettingLyrics(true);
				// axios.get(`http://localhost:3000/getFullLyricsNStats`, { params:
				axios.get(`https://swift-api.fly.dev/getFullLyricsNStats`, { params:
				{ 'album': fighter }
				})
				.then(function (response) {								
					fullLyricsNStats = fullLyricsNStats.concat(response.data.fullLyricsNStats)
					// setSongFilter('Anti-Hero')
					console.log('fullLyricsNStats', fullLyricsNStats)
					if (songsFullDB.length > 0) {
						let first_track = songsFullDB.filter(s=> s.album_key == albumFilter)[0].song
						setSongFilter(first_track)
						setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == first_track))
					}
	
					setGettingLyrics(false);
				})
				.catch(function (error) {	
					console.log(error);
				});	
			}
			else {
				// filter lyrics for album 
				console.log('already have lyrics for ', fighter)
				if (songsFullDB.length > 0) {
					let first_track = songsFullDB.filter(s=> s.album_key == albumFilter)[0].song
					setSongFilter(first_track)
					setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == first_track))
				}
			}

		}
		
	}, [fighter])

	useEffect(() => {
		// console.log(top40)
		const bounce = d3.transition()
		.duration(1500)
		.ease(d3.easeBounce);

		let bottom40 = lyricStats.filter(x=> x.total > 25 && x.accuracy < 25).sort((a, b) => b.accuracy - a.accuracy).slice(0,40)
		let top40chartSongs = d3.select('#top40VizAns')
		
		var top40Songs = top40chartSongs
			.selectAll<SVGRectElement, LyricData>('rect').data(top40, function(d: LyricData) {
			return d.lyric_id
		})
		
		top40Songs.enter().append('rect')
			.attr('class', function (d: LyricData) { return `ans ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})					
			.transition(bounce)
			.attr('x', 20)			
			.attr('y', function(_, i: number) { 
				return i * 20 + 30})
			.style('width', 400)
			// .style('height', '100%')
			.style('height', function(d: LyricData){
				if (screenSize.width < 400) {
					if (d.lyric.length > 51){
						// need two rows for long lines, can't use height to 100% if want any transitions tho
						return '54px'  
					} else {
						return '30px'
					}
				} else {
					if (d.lyric.length > 53){
						// need two rows for long lines, can't use height to 100% if want any transitions tho
						return '54px'  
					} else {
						return '30px'
					}
				}
				
			})
			.style("overflow-x", "visible") // Allow text overflow			
			.text(function(d: LyricData) { return d.song })
		

		let top40chart = d3.select('#top40Viz')
		
		var top40lines = top40chart
			.selectAll<SVGRectElement, LyricData>('rect').data(top40, function(d: LyricData) {
			return d.lyric_id
		})

		top40lines.enter().append('rect')			
			.attr('class', function (d: LyricData) { return `top40Lyrics ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})	
			// .on('mouseover', function(d) { console.log(d)})
			.transition(bounce)							
			.attr('x', 20)			
			.attr('y', function(_, i: number) { 
				return (i * 20 + 30)})			
			.style('width', 400)
			// .style('height', '100%')
			.style('height', function(d: LyricData){
				if (screenSize.width < 400) {
					if (d.lyric.length > 51){
						// need two rows for long lines, can't use height to 100% if want any transitions tho
						return '54px'  
					} else {
						return '30px'
					}
				} else {
					if (d.lyric.length > 53){
						// need two rows for long lines, can't use height to 100% if want any transitions tho
						return '54px'  
					} else {
						return '30px'
					}
				}
			})
			.style("overflow-x", "visible") // Allow text overflow			
			.text(function(d: LyricData) { return d.lyric })


		let bottom40ChartSongs = d3.select('#bottom40VizAns')
		let bottom40Songs = bottom40ChartSongs.selectAll<SVGRectElement, LyricData>('rect').data(bottom40, function(d: LyricData){
			return d.lyric_id
		})
		
		bottom40Songs.join(enter => 
				enter.append('rect')
				.attr('class',function (d: LyricData) { return `ans ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})
				.attr('x', 20)			
				.attr('y', function(_, i: number) { 
					return i * 20 + 30})
				.style('width', 400)
				// .style('height', '100%')
				.style('height', function(d: LyricData){
					if (d.lyric.length > 53){
						// need two rows for long lines, can't use height to 100% if want any transitions tho
						return '54px'  
					} else {
						return '30px'
					}
				})
				.style("overflow-x", "visible") // Allow text overflow			
				.text(function(d: LyricData) { return d.song })		
		)

		let bottom40chart = d3.select('#bottom40Viz')
		
		var bottom40lines = bottom40chart
			.selectAll<SVGRectElement, LyricData>('rect').data(bottom40, function(d: LyricData) {
			return d.lyric_id
		})

		bottom40lines.join(enter=> (
			enter.append('rect')
			.attr('class', function (d: LyricData) { return `bottom40Lyrics ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})					
			.attr('x', 20)			
			.attr('y', function(_, i: number) { 
				return (i * 20 + 30)})
			.style('width', 400)
			// .style('height', '100%')
			.style('height', function(d: LyricData){
				if (d.lyric.length > 53){
					// need two rows for long lines, can't use height to 100% if want any transitions tho
					return '54px'  
				} else {
					return '30px'
				}
			})
			.style("overflow-x", "visible") // Allow text overflow			
			.text(function(d: LyricData) { return d.lyric })
		)) 
		
		// top40lines.append('rect')
		// 	.attr('class', function (d: LyricData) { return `top40Lyrics ${albumColorKey[d.album_key as keyof typeof albumColorKey]}`})					
		// 	.attr('x', 20)			
		// 	.attr('y', function(_, i: number) { 
		// 		return i * 20 + 30})
		// 	.style('width', 400)
		// 	// .style('height', '100%')
		// 	.style('height', function(d: LyricData){
		// 		if (d.lyric.length > 53){
		// 			// need two rows for long lines, can't use height to 100% if want any transitions tho
		// 			return '54px'  
		// 		} else {
		// 			return '30px'
		// 		}
		// 	})
		// 	.style("overflow-x", "visible") // Allow text overflow			
		// 	.text(function(d: LyricData) { return d.lyric })
		
			
	}, [top40, showTop40])

	// function clicked(e, d){
	// 	console.log(this)
	// 	d3.select(this).append('g')			
	// 		.attr("transform", "translate(42, 42)");
	// }

	useEffect(() => {
		// lyrical data viz 
		
		if (displayLyrics.length > 0) {

			// const t = d3.transition()
			// 	.duration(750)
			// 	.ease(d3.easeLinear);

			d3.selectAll('.lyrics').remove()

			let lyrics_viz = d3.select('#lyricalViz').append('g.lyrics')
			let lyrics = lyrics_viz.selectAll<SVGElement, LyricData>('svg').data(displayLyrics, function(d: LyricData) { return d.lyric})

			lyrics.enter().append('text')
				.attr('class', function (d: LyricData) { 
					return `lyrics ${albumColorKey[d.album_key as keyof typeof albumColorKey]}-${d.accuracy_group}`					
				})
				.attr('x', 20)
				.attr('y', function(_, i: number) { 
					return i * 20 + 30})			
				.attr("text-anchor", "start")
				.style("overflow-x", "visible") // Allow text overflow
				.text(function(d: LyricData) { return d.lyric })				
				// .on('mouseover', function (d: MouseEvent) {
				// 	console.log(d.target.__data__)			
				// })
			
	} else {
		// remove data 
		d3.selectAll('.top40Lyrics').remove()
		d3.selectAll('.lyrics').remove()

	}

	}, [displayLyrics, albumFilter])

	
	async function delayedDataFetch() {
		
		axios.get(`https://swift-api.fly.dev/getSongs`)
		// axios.get(`http://localhost:3000/getSongs`)
			.then(function (response) {					
				// setSongList(response.data.songList.filter(x => x.album_key == albumFilter))
				songsFullDB = response.data.songList
				// console.log(songsFullDB)
			})
			.catch(function (error) {				
				console.log(error);
			});	

		setIsLoading(true)
		// axios.get(`http://localhost:3000/getLyricStats`)
		axios.get(`https://swift-api.fly.dev/getLyricStats`)
		.then(function (response) {								
			lyricStats = response.data.lyricStats
			console.log(lyricStats)
			setTop40(lyricStats.filter(x => x.total > 20 && x.accuracy > 95).slice(0, 40))
			// console.log(lyricStats)
			setIsLoading(false)
		})
		.catch(function (error) {				
			console.log(error);
		});	

	}

	function changeViz(cover: AlbumArt){
		d3.selectAll('.lyrics').remove()

		setDisplayLyrics([])
		setShowTop40(false)
		setFighter(cover);	 
		setAlbumFilter(cover);							
		setSongList(songsFullDB.filter(s=> s.album_key == cover))				
		
	}




	return (
		<>
			<Nav location={location}></Nav>
			{isLoading && <div className='grid grid-cols-1 p-2 justify-items-center mt-20 lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2 justify-center'>
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />	
				</div>
				<Loader/>
			
				</div>}
				{!isLoading && <div className='grid grid-cols-1 p-2 justify-items-center mt-20 lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2 justify-center'>
				
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />				
				</div>	
				
				<div>
					<div className='flex flex-row flex-wrap justify-center' ref={newSongRef}>					
					{albumCovers.map(x=> <img src={`/icons/${x}.jpg`} key={x} className ={`albums ${fighter != x ? 'faded' : fighter == x ? 'selected' : ''}`} onClick={()=> {
						changeViz(x)						
						}}></img>)}					
					</div>	
				</div>

				{<div className='ml-4 mr-4'>					
						{gettingLyrics && <Loader/>}						
				</div>}
						
				{/* legend for album on desktop */}
				{!gettingLyrics && !showTop40 && displayLyrics && 
				screenSize.width >= 828 && <LyricalVizLegend fighter={fighter}/>
				}			

				{/* lyrics data viz by song  */}
				<div className='flex flex-row flex-wrap justify-center'>
					{!gettingLyrics && !showTop40 && displayLyrics && <div>
						{songList.map((x)=> 
						<div onClick={() => { 
							setSongFilter(x.song);
							setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == x.song));
							// scroll to top of data viz, buffer for nav bar on mobile
							if (screenSize.width < 828) {
								// scroll to top of legend on mobile
								window.scrollTo({top: scrollRef.current ? scrollRef.current?.offsetTop - 175 : 0, behavior: 'smooth'})							
							} else{
								window.scrollTo({top: scrollRef.current ? scrollRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})							
							}
							
						}}
						className={`cursor-pointer rounded-t-xl rounded-b-xl text-center m-2 p-1 pl-3 pr-3 text-m font-bold ${albumColorKey[x.album_key as keyof typeof albumColorKey]} ${songFilter == x.song ? 'selected' : 'faded'}`}
						key={`${x.song}`}
							>{x.song}</div>)}
					</div>}	

					{!gettingLyrics && !showTop40 && displayLyrics && 
					screenSize.width < 828 && <LyricalVizLegend fighter={fighter}/>
					}							
					
					{showTop40 && <div>	
						<div className='flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p>Jump to: <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: cultFailRef.current ? cultFailRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> We Forgot These Existed </span> | <span className='font-bold cursor-pointer'
							onClick={()=> {
								window.scrollTo({top: spotifyRef.current ? spotifyRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})
								setGenViz(true)
								}}> The Story of Us </span> </p> </div>							
						<h2 ref={top40Ref}>Long Live the Swiftest Top 40</h2>
						<h5>Most quickly identified lyrics with 95+% accuracy–do you recognize all of them? </h5>
						<h6>Hover over the lyric to reveal the song! Scroll to the end to see the top songs. Lyrics with the title in it were excluded.</h6>						
						<div id='top40VizAns'>
							{/* <svg id='top40Viz'></svg> */}
							{/* <svg viewBox="0 0 100 200"
							ref={top40ref}></svg> */}
						</div>
						<div id='top40Viz'>
						</div>
						<div className='flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p>Jump to: <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: top40Ref.current ? top40Ref.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> The Swiftest Top 40</span> | <span className='font-bold cursor-pointer'
							onClick={()=> {
								window.scrollTo({top: spotifyRef.current ? spotifyRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})
								setGenViz(true);
							}
							}> The Story of Us </span> </p> </div>			
						<div className='wrapper'>
							<h2 ref={cultFailRef}>We Forgot These Existed</h2>
							<div id='bottom40VizAns'>							
							</div>
							<div id='bottom40Viz'>
							</div>
							<div className='flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p>Jump to: <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: top40Ref.current ? top40Ref.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> The Swiftest Top 40</span> | <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: cultFailRef.current ? cultFailRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> We Forgot These Existed </span> </p> </div>
						</div>	
						<div className='wrapper'>
						{/* <h6>Are the most recognized songs also the most popular songs? </h6> */}
						<InView as="div" 
							threshold={0}
							onChange={(inView) => {
							if (inView) {
								setGenViz(true)
							}}}>
								<h2 id='spotifysection' ref={spotifyRef} >It is Over Now?/The Story of Us</h2>
								<h6>Are the songs with the most recognized lyrics also the most popular songs? </h6>
							<h6>Hover/click on a circle to see play counts vs accuracy and the top line. Drag and select a region to zoom. Double click on the chart to reset/zoom out.</h6></InView> 
						<div id='spotifyscatter' ></div>
						<div className='jumpbox flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p>Jump to: <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: top40Ref.current ? top40Ref.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> The Swiftest Top 40</span> | <span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: cultFailRef.current ? cultFailRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})}> We Forgot These Existed </span> </p> </div>	
						</div>

					</div>}

					{!showTop40 && <div>
						<div id='lyricalViz' ref={scrollRef}></div>
						<div className='flex flex-row flex-wrap justify-center mx-auto m-2 text-center'><p><span className='font-bold cursor-pointer'
							onClick={()=> window.scrollTo({top: newSongRef.current ? newSongRef.current?.offsetTop - 20: 0, behavior: 'smooth'})}> Jump to top for another song! </span> </p> </div>	
					</div>}
					
				</div>
					
				
				
			</div>}
		</>
	)

}

export default Dataland