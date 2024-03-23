// import { useState, useEffect, MouseEvent } from 'react'
import { useState, useEffect, useRef } from 'react'
import title from '/title.svg'
import axios from 'axios';
import Nav from './Nav.tsx'
import * as d3 from 'd3';
import { InView } from "react-intersection-observer";

// import moment from 'moment';

let lyricStats: LyricData[] = []   //unique list of lyrics w/speed/accuracy stats

// 
let fullLyricsNStats: LyricData[] = []  // lyrics for a song with accuracy/speed but not unique list of lyrics 
let songsFullDB: SongList[] = [] // all songs 

var spotify_easy = [{'song': 'All Too Well (10 Minute Version)',
'accuracy': 96.00886918,
'daily_counts': 828429,
'historical_counts': 798581857,
'album': 'Red'},
{'song': 'All Too Well',
'accuracy': 93.70277078,
'daily_counts': 349636,
'historical_counts': 531679390,
'album': 'Red'},
{'song': 'Cruel Summer',
'accuracy': 89.56262425,
'daily_counts': 4838871,
'historical_counts': 1894418735,
'album': 'Lover'},
{'song': 'the last great american dynasty',
'accuracy': 94.97816594,
'daily_counts': 359252,
'historical_counts': 352387356,
'album': 'folklore'},
{'song': 'The Man',
'accuracy': 94.69194313,
'daily_counts': 818259,
'historical_counts': 724184313,
'album': 'Lover'},
{'song': 'Shake It Off',
'accuracy': 92.67767408,
'daily_counts': 1206044,
'historical_counts': 1433785645,
'album': '1989'},
{'song': 'Vigilante Shit',
'accuracy': 93.5483871,
'daily_counts': 401539,
'historical_counts': 367870021,
'album': 'Midnights'},
{'song': 'no body, no crime',
'accuracy': 93.62549801,
'daily_counts': 214899,
'historical_counts': 260057041,
'album': 'evermore'},
{'song': 'Blank Space',
'accuracy': 91.44811859,
'daily_counts': 1708484,
'historical_counts': 1880928875,
'album': '1989'},
{'song': 'Anti-Hero',
'accuracy': 92.91784703,
'daily_counts': 1858417,
'historical_counts': 1539644892,
'album': 'Midnights'},
{'song': 'Look What You Made Me Do',
'accuracy': 90.05076142,
'daily_counts': 812301,
'historical_counts': 1095286627,
'album': 'reputation'},
{'song': 'London Boy',
'accuracy': 87.98908098,
'daily_counts': 293015,
'historical_counts': 309363838,
'album': 'Lover'},
{'song': 'Better Than Revenge',
'accuracy': 89.33002481,
'daily_counts': 279886,
'historical_counts': 305040443,
'album': 'Speak Now'},
{'song': 'champagne problems',
'accuracy': 91.10169492,
'daily_counts': 604674,
'historical_counts': 570479082,
'album': 'evermore'},
{'song': 'Would’ve, Could’ve, Should’ve',
'accuracy': 84.24803991,
'daily_counts': 271168,
'historical_counts': 249751321,
'album': 'Midnights'},
{'song': 'Delicate',
'accuracy': 85.54396423,
'daily_counts': 847058,
'historical_counts': 1019641841,
'album': 'reputation'},
{'song': 'the 1',
'accuracy': 86.57047725,
'daily_counts': 553357,
'historical_counts': 553451807,
'album': 'folklore'},
{'song': 'august',
'accuracy': 87.04819277,
'daily_counts': 1310219,
'historical_counts': 1015561112,
'album': 'folklore'},
{'song': 'Lover',
'accuracy': 92.5445705,
'daily_counts': 2030402,
'historical_counts': 1595171925,
'album': 'Lover'},
{'song': 'Getaway Car',
'accuracy': 87.52703677,
'daily_counts': 737525,
'historical_counts': 618176317,
'album': 'reputation'},
{'song': 'I Did Something Bad',
'accuracy': 87.9709187,
'daily_counts': 375972,
'historical_counts': 417017766,
'album': 'reputation'},
{'song': '...Ready for It?',
'accuracy': 85.96614951,
'daily_counts': 814919,
'historical_counts': 695764045,
'album': 'reputation'},
{'song': 'tolerate it',
'accuracy': 90.34883721,
'daily_counts': 425837,
'historical_counts': 284308439,
'album': 'evermore'},
{'song': 'We Are Never Ever Getting Back Together',
'accuracy': 91.28919861,
'daily_counts': 772480,
'historical_counts': 950176303,
'album': 'Red'},
{'song': 'betty',
'accuracy': 84.56269758,
'daily_counts': 339791,
'historical_counts': 350367549,
'album': 'folklore'},
{'song': '22',
'accuracy': 89.33333333,
'daily_counts': 603582,
'historical_counts': 630905510,
'album': 'Red'},
{'song': 'willow',
'accuracy': 88.02017654,
'daily_counts': 819281,
'historical_counts': 860043471,
'album': 'evermore'},
{'song': 'Mean',
'accuracy': 85.52774755,
'daily_counts': 262660,
'historical_counts': 317804641,
'album': 'Speak Now'},
{'song': 'You Need To Calm Down',
'accuracy': 91.29464286,
'daily_counts': 683496,
'historical_counts': 907800363,
'album': 'Lover'},
{'song': 'Back to December',
'accuracy': 89.09657321,
'daily_counts': 570229,
'historical_counts': 625713286,
'album': 'Speak Now'},
{'song': 'Bejeweled',
'accuracy': 88.90688259,
'daily_counts': 637358,
'historical_counts': 491884754,
'album': 'Midnights'},
{'song': 'Dear John',
'accuracy': 84.99573743,
'daily_counts': 221420,
'historical_counts': 239933495,
'album': 'Speak Now'},
{'song': 'Long Live',
'accuracy': 86.00508906,
'daily_counts': 384343,
'historical_counts': 213449199,
'album': 'Speak Now'},
{'song': 'gold rush',
'accuracy': 84.24317618,
'daily_counts': 240192,
'historical_counts': 272063104,
'album': 'evermore'},
{'song': 'Karma',
'accuracy': 85.69518717,
'daily_counts': 1215821,
'historical_counts': 788632919,
'album': 'Midnights'},
{'song': 'mirrorball',
'accuracy': 83.31627431,
'daily_counts': 444554,
'historical_counts': 404936394,
'album': 'folklore'},
{'song': 'Style',
'accuracy': 85.72542902,
'daily_counts': 1515988,
'historical_counts': 1316500151,
'album': '1989'},
{'song': 'closure',
'accuracy': 81.86889819,
'daily_counts': 106165,
'historical_counts': 115995807,
'album': 'evermore'},
{'song': 'invisible string',
'accuracy': 82.8854314,
'daily_counts': 393745,
'historical_counts': 351948891,
'album': 'folklore'},
{'song': 'This Is Why We Can’t Have Nice Things',
'accuracy': 89.03177005,
'daily_counts': 183150,
'historical_counts': 209430370,
'album': 'reputation'},
{'song': 'Mastermind',
'accuracy': 85.8044164,
'daily_counts': 362579,
'historical_counts': 317349147,
'album': 'Midnights'},
{'song': 'Out of the Woods',
'accuracy': 88.34405145,
'daily_counts': 474224,
'historical_counts': 425928730,
'album': '1989'},
{'song': 'my tears ricochet',
'accuracy': 87.31884058,
'daily_counts': 556534,
'historical_counts': 460919597,
'album': 'folklore'},
{'song': 'Love Story',
'accuracy': 83.47183749,
'daily_counts': 1580463,
'historical_counts': 1581270493,
'album': 'Fearless'},
{'song': 'You Belong With Me',
'accuracy': 90.39767216,
'daily_counts': 1293391,
'historical_counts': 1208639565,
'album': 'Fearless'},
{'song': 'The Archer',
'accuracy': 81.44444444,
'daily_counts': 516662,
'historical_counts': 377018890,
'album': 'Lover'},
{'song': 'You’re On Your Own, Kid',
'accuracy': 84.78991597,
'daily_counts': 765384,
'historical_counts': 535629617,
'album': 'Midnights'},
{'song': 'marjorie',
'accuracy': 85.82020389,
'daily_counts': 292749,
'historical_counts': 196546182,
'album': 'evermore'},
{'song': 'Wildest Dreams',
'accuracy': 87.13156003,
'daily_counts': 1350796,
'historical_counts': 1607342237,
'album': '1989'},
{'song': 'Speak Now',
'accuracy': 82.11382114,
'daily_counts': 209583,
'historical_counts': 238249229,
'album': 'Speak Now'},
{'song': 'You Are in Love',
'accuracy': 84.04605263,
'daily_counts': 242346,
'historical_counts': 201676567,
'album': '1989'},
{'song': 'Never Grow Up',
'accuracy': 84.71760797,
'daily_counts': 117843,
'historical_counts': 133973455,
'album': 'Speak Now'},
{'song': 'Glitch',
'accuracy': 83.00970874,
'daily_counts': 111017,
'historical_counts': 114797035,
'album': 'Midnights'},
{'song': 'King of My Heart',
'accuracy': 80.32909499,
'daily_counts': 244559,
'historical_counts': 253103078,
'album': 'reputation'},
{'song': 'Welcome to New York',
'accuracy': 90.30023095,
'daily_counts': 412105,
'historical_counts': 335215320,
'album': '1989'},
{'song': 'Question...?',
'accuracy': 76.41369048,
'daily_counts': 205251,
'historical_counts': 283661670,
'album': 'Midnights'},
{'song': 'Our Song',
'accuracy': 85.12658228,
'daily_counts': 304633,
'historical_counts': 319114264,
'album': 'Taylor Swift'},
{'song': 'I Know Places',
'accuracy': 81.98757764,
'daily_counts': 212197,
'historical_counts': 199294031,
'album': '1989'},
{'song': 'illicit affairs',
'accuracy': 86.38228056,
'daily_counts': 660294,
'historical_counts': 385146345,
'album': 'folklore'},
{'song': 'Enchanted',
'accuracy': 83.09503785,
'daily_counts': 1220719,
'historical_counts': 1015736919,
'album': 'Speak Now'},
{'song': 'ME!',
'accuracy': 82.83783784,
'daily_counts': 341860,
'historical_counts': 840391228,
'album': 'Lover'},
{'song': 'Clean',
'accuracy': 86.74242424,
'daily_counts': 352527,
'historical_counts': 270610280,
'album': '1989'},
{'song': 'Miss Americana & The Heartbreak Prince',
'accuracy': 84.43579767,
'daily_counts': 568862,
'historical_counts': 340133007,
'album': 'Lover'},
{'song': 'Cornelia Street',
'accuracy': 82.08802456,
'daily_counts': 364458,
'historical_counts': 374980583,
'album': 'Lover'},
{'song': 'Don’t Blame Me',
'accuracy': 76.36239782,
'daily_counts': 1429039,
'historical_counts': 1024728132,
'album': 'reputation'},
{'song': 'New Romantics',
'accuracy': 88.67243867,
'daily_counts': 483308,
'historical_counts': 367822145,
'album': '1989'},
{'song': 'Fifteen',
'accuracy': 84.40366972,
'daily_counts': 145522,
'historical_counts': 208028781,
'album': 'Fearless'},
{'song': 'right where you left me',
'accuracy': 83.69230769,
'daily_counts': 415708,
'historical_counts': 302797236,
'album': 'evermore'},
{'song': 'this is me trying',
'accuracy': 84.92268041,
'daily_counts': 463454,
'historical_counts': 381264085,
'album': 'folklore'},
{'song': 'High Infidelity',
'accuracy': 84.58376156,
'daily_counts': 137738,
'historical_counts': 144054658,
'album': 'Midnights'},
{'song': 'Hits Different',
'accuracy': 76.17021277,
'daily_counts': 310886,
'historical_counts': 167630713,
'album': 'Midnights'},
{'song': 'Bigger Than The Whole Sky',
'accuracy': 87.2611465,
'daily_counts': 192259,
'historical_counts': 170401206,
'album': 'Midnights'},
{'song': 'the lakes',
'accuracy': 84.31845597,
'daily_counts': 233559,
'historical_counts': 196751017,
'album': 'folklore'},
{'song': 'Gorgeous',
'accuracy': 88.55646971,
'daily_counts': 427747,
'historical_counts': 566477342,
'album': 'reputation'},
{'song': 'mad woman',
'accuracy': 82.54252462,
'daily_counts': 189702,
'historical_counts': 211332444,
'album': 'folklore'},
{'song': 'The Story of Us',
'accuracy': 81.29432624,
'daily_counts': 222759,
'historical_counts': 286295937,
'album': 'Speak Now'},
{'song': 'Bad Blood',
'accuracy': 78.5472973,
'daily_counts': 846681,
'historical_counts': 875142100,
'album': '1989'},
{'song': 'cowboy like me',
'accuracy': 78.5660941,
'daily_counts': 188818,
'historical_counts': 174859421,
'album': 'evermore'},
{'song': 'Stay Stay Stay',
'accuracy': 80.47138047,
'daily_counts': 80085,
'historical_counts': 140964750,
'album': 'Red'},
{'song': 'I’m Only Me When I’m with You',
'accuracy': 74.77707006,
'daily_counts': 42776,
'historical_counts': 48551983,
'album': 'Taylor Swift'},
{'song': 'New Year’s Day',
'accuracy': 88.35690968,
'daily_counts': 181327,
'historical_counts': 183854172,
'album': 'reputation'},
{'song': 'it’s time to go',
'accuracy': 81.11824015,
'daily_counts': 119289,
'historical_counts': 101727406,
'album': 'evermore'},
{'song': 'exile',
'accuracy': 83.93113343,
'daily_counts': 675345,
'historical_counts': 757256880,
'album': 'folklore'},
{'song': 'The Great War',
'accuracy': 82.34453181,
'daily_counts': 261693,
'historical_counts': 261330173,
'album': 'Midnights'},
{'song': '’tis the damn season',
'accuracy': 85.74162679,
'daily_counts': 262215,
'historical_counts': 252719118,
'album': 'evermore'},
{'song': 'peace',
'accuracy': 79.59413754,
'daily_counts': 193013,
'historical_counts': 206628763,
'album': 'folklore'},
{'song': 'Dress',
'accuracy': 77.43772242,
'daily_counts': 432344,
'historical_counts': 300282921,
'album': 'reputation'},
{'song': 'End Game',
'accuracy': 75.11715089,
'daily_counts': 338312,
'historical_counts': 475395652,
'album': 'reputation'},
{'song': 'How You Get the Girl',
'accuracy': 81.72147002,
'daily_counts': 238417,
'historical_counts': 226198927,
'album': '1989'},
{'song': 'Red',
'accuracy': 84.43113772,
'daily_counts': 390256,
'historical_counts': 533669301,
'album': 'Red'},
{'song': 'Paper Rings',
'accuracy': 83.07086614,
'daily_counts': 599131,
'historical_counts': 607440456,
'album': 'Lover'},
{'song': 'So It Goes...',
'accuracy': 72.1642764,
'daily_counts': 170142,
'historical_counts': 171067755,
'album': 'reputation'},
{'song': 'All You Had to Do Was Stay',
'accuracy': 78.17817818,
'daily_counts': 320921,
'historical_counts': 297184562,
'album': '1989'},
{'song': 'hoax',
'accuracy': 77.44932432,
'daily_counts': 171096,
'historical_counts': 186632672,
'album': 'folklore'},
{'song': 'Picture To Burn',
'accuracy': 83.98533007,
'daily_counts': 155886,
'historical_counts': 183345090,
'album': 'Taylor Swift'},
{'song': 'Lavender Haze',
'accuracy': 82.91571754,
'daily_counts': 664675,
'historical_counts': 724656444,
'album': 'Midnights'},
{'song': 'Mine',
'accuracy': 78.0141844,
'daily_counts': 426880,
'historical_counts': 428111386,
'album': 'Speak Now'},
{'song': 'Dancing with Our Hands Tied',
'accuracy': 78.5770751,
'daily_counts': 230086,
'historical_counts': 236075654,
'album': 'reputation'},
{'song': 'Paris',
'accuracy': 82.00514139,
'daily_counts': 163593,
'historical_counts': 171276499,
'album': 'Midnights'},
{'song': 'Snow On The Beach',
'accuracy': 75.46666667,
'daily_counts': 593289,
'historical_counts': 573549710,
'album': 'Midnights'},
{'song': 'Call It What You Want',
'accuracy': 80.43193717,
'daily_counts': 355135,
'historical_counts': 379200101,
'album': 'reputation'},
{'song': 'Teardrops On My Guitar',
'accuracy': 80.16431925,
'daily_counts': 161649,
'historical_counts': 251613542,
'album': 'Taylor Swift'},
{'song': 'I Almost Do',
'accuracy': 74.81617647,
'daily_counts': 88208,
'historical_counts': 148520405,
'album': 'Red'},
{'song': 'I Knew You Were Trouble',
'accuracy': 80.55925433,
'daily_counts': 504820,
'historical_counts': 316199313,
'album': 'Red'},
{'song': 'epiphany',
'accuracy': 82.58706468,
'daily_counts': 160783,
'historical_counts': 183721884,
'album': 'folklore'},
{'song': 'Come Back... Be Here',
'accuracy': 72.3880597,
'daily_counts': 126414,
'historical_counts': 146444321,
'album': 'Red'},
{'song': 'Haunted',
'accuracy': 73.20341048,
'daily_counts': 192455,
'historical_counts': 198547057,
'album': 'Speak Now'},
{'song': 'Wonderland',
'accuracy': 77.91932059,
'daily_counts': 225728,
'historical_counts': 207141933,
'album': '1989'},
{'song': 'If This Was a Movie',
'accuracy': 72.82608696,
'daily_counts': 98269,
'historical_counts': 103924209,
'album': 'Speak Now'},
{'song': 'Death by a Thousand Cuts',
'accuracy': 82.05645161,
'daily_counts': 252884,
'historical_counts': 308506670,
'album': 'Lover'},
{'song': 'Sad Beautiful Tragic',
'accuracy': 77.36263736,
'daily_counts': 99141,
'historical_counts': 129888884,
'album': 'Red'},
{'song': 'I Think He Knows',
'accuracy': 76.84859155,
'daily_counts': 219937,
'historical_counts': 259713692,
'album': 'Lover'},
{'song': "Should've Said No",
'accuracy': 77.61627907,
'daily_counts': 96385,
'historical_counts': 127263654,
'album': 'Taylor Swift'},
{'song': 'Midnight Rain',
'accuracy': 77.64578834,
'daily_counts': 653679,
'historical_counts': 612748183,
'album': 'Midnights'},
{'song': 'Maroon',
'accuracy': 78.13911472,
'daily_counts': 392364,
'historical_counts': 430030824,
'album': 'Midnights'},
{'song': 'Dear Reader',
'accuracy': 75.68756876,
'daily_counts': 147365,
'historical_counts': 119089264,
'album': 'Midnights'},
{'song': 'cardigan',
'accuracy': 83.8673412,
'daily_counts': 1629331,
'historical_counts': 1252182331,
'album': 'folklore'},
{'song': 'Mary’s Song',
'accuracy': 79.23211169,
'daily_counts': 39645,
'historical_counts': 43043203,
'album': 'Taylor Swift'},
{'song': 'Treacherous',
'accuracy': 77.4559194,
'daily_counts': 99283,
'historical_counts': 175452328,
'album': 'Red'},
{'song': 'Soon You’ll Get Better',
'accuracy': 78.45659164,
'daily_counts': 100421,
'historical_counts': 137806474,
'album': 'Lover'},
{'song': 'Fearless',
'accuracy': 79.85989492,
'daily_counts': 588977,
'historical_counts': 377391464,
'album': 'Fearless'},
{'song': 'State of Grace',
'accuracy': 82.1812596,
'daily_counts': 158381,
'historical_counts': 250619191,
'album': 'Red'},
{'song': 'Tied Together With A Smile',
'accuracy': 70.02096436,
'daily_counts': 30916,
'historical_counts': 31786988,
'album': 'Taylor Swift'},
{'song': 'False God',
'accuracy': 81.81818182,
'daily_counts': 279383,
'historical_counts': 218340640,
'album': 'Lover'},
{'song': 'Begin Again',
'accuracy': 78.88198758,
'daily_counts': 140175,
'historical_counts': 220317496,
'album': 'Red'},
{'song': 'Labyrinth',
'accuracy': 69.98394864,
'daily_counts': 271441,
'historical_counts': 255740743,
'album': 'Midnights'},
{'song': 'It’s Nice to Have a Friend',
'accuracy': 75.24752475,
'daily_counts': 99647,
'historical_counts': 125540815,
'album': 'Lover'},
{'song': 'Everything Has Changed',
'accuracy': 74.37908497,
'daily_counts': 237162,
'historical_counts': 408928018,
'album': 'Red'},
{'song': 'Untouchable',
'accuracy': 68.46846847,
'daily_counts': 71543,
'historical_counts': 75598667,
'album': 'Fearless'},
{'song': 'A Perfectly Good Heart',
'accuracy': 72.57019438,
'daily_counts': 23820,
'historical_counts': 24448486,
'album': 'Taylor Swift'},
{'song': 'A Place In This World',
'accuracy': 74.95495495,
'daily_counts': 37258,
'historical_counts': 39477757,
'album': 'Taylor Swift'},
{'song': 'Tim McGraw',
'accuracy': 76.93965517,
'daily_counts': 97311,
'historical_counts': 124268597,
'album': 'Taylor Swift'},
{'song': 'The Best Day',
'accuracy': 80.26315789,
'daily_counts': 63393,
'historical_counts': 88116540,
'album': 'Fearless'},
{'song': 'Afterglow',
'accuracy': 73.04964539,
'daily_counts': 384956,
'historical_counts': 357329649,
'album': 'Lover'},
{'song': 'coney island',
'accuracy': 81.60690571,
'daily_counts': 152162,
'historical_counts': 169770435,
'album': 'evermore'},
{'song': 'I Forgot That You Existed',
'accuracy': 78.89009793,
'daily_counts': 197323,
'historical_counts': 323701936,
'album': 'Lover'},
{'song': 'Today Was a Fairytale',
'accuracy': 67.27549467,
'daily_counts': 64127,
'historical_counts': 81153844,
'album': 'Fearless'},
{'song': 'seven',
'accuracy': 83.78378378,
'daily_counts': 297386,
'historical_counts': 302280191,
'album': 'folklore'},
{'song': 'White Horse',
'accuracy': 76.86746988,
'daily_counts': 166798,
'historical_counts': 199478097,
'album': 'Fearless'},
{'song': 'You’re Not Sorry',
'accuracy': 77.20930233,
'daily_counts': 91173,
'historical_counts': 113467359,
'album': 'Fearless'},
{'song': 'Holy Ground',
'accuracy': 75.50143266,
'daily_counts': 94748,
'historical_counts': 135145628,
'album': 'Red'},
{'song': 'Hey Stephen',
'accuracy': 78.64197531,
'daily_counts': 98041,
'historical_counts': 132327534,
'album': 'Fearless'},
{'song': 'Jump Then Fall',
'accuracy': 73.14629259,
'daily_counts': 66204,
'historical_counts': 77682084,
'album': 'Fearless'},
{'song': 'dorothea',
'accuracy': 76.28705148,
'daily_counts': 150828,
'historical_counts': 163520077,
'album': 'evermore'},
{'song': 'Forever & Always',
'accuracy': 73.20261438,
'daily_counts': 189830,
'historical_counts': 232543556,
'album': 'Fearless'},
{'song': 'The Lucky One',
'accuracy': 80.18018018,
'daily_counts': 70736,
'historical_counts': 116344190,
'album': 'Red'},
{'song': 'Daylight',
'accuracy': 75.97998332,
'daily_counts': 634557,
'historical_counts': 376083494,
'album': 'Lover'},
{'song': 'Girl at Home',
'accuracy': 79.49080622,
'daily_counts': 54651,
'historical_counts': 78130065,
'album': 'Red'},
{'song': 'Tell Me Why',
'accuracy': 70.62211982,
'daily_counts': 66955,
'historical_counts': 84836974,
'album': 'Fearless'},
{'song': 'I Wish You Would',
'accuracy': 76.71232877,
'daily_counts': 282427,
'historical_counts': 220552422,
'album': '1989'},
{'song': 'Last Kiss',
'accuracy': 72.5,
'daily_counts': 178837,
'historical_counts': 194694671,
'album': 'Speak Now'},
{'song': 'Starlight',
'accuracy': 74.60567823,
'daily_counts': 75934,
'historical_counts': 109720986,
'album': 'Red'},
{'song': 'Ours',
'accuracy': 76.6297663,
'daily_counts': 116393,
'historical_counts': 124929243,
'album': 'Speak Now'},
{'song': 'ivy',
'accuracy': 81.07556161,
'daily_counts': 209176,
'historical_counts': 205279903,
'album': 'evermore'},
{'song': 'Sparks Fly',
'accuracy': 74.7957993,
'daily_counts': 296594,
'historical_counts': 291913891,
'album': 'Speak Now'},
{'song': 'The Moment I Knew',
'accuracy': 74.38596491,
'daily_counts': 68347,
'historical_counts': 98737020,
'album': 'Red'},
{'song': 'The Last Time',
'accuracy': 57.20720721,
'daily_counts': 124710,
'historical_counts': 170894243,
'album': 'Red'},
{'song': 'Innocent',
'accuracy': 76.63656885,
'daily_counts': 80687,
'historical_counts': 93366524,
'album': 'Speak Now'},
{'song': 'Stay Beautiful',
'accuracy': 68.83116883,
'daily_counts': 29790,
'historical_counts': 33317251,
'album': 'Taylor Swift'},
{'song': 'Cold as You',
'accuracy': 71.84300341,
'daily_counts': 38277,
'historical_counts': 40861638,
'album': 'Taylor Swift'},
{'song': 'Breathe',
'accuracy': 67.73722628,
'daily_counts': 77406,
'historical_counts': 130251729,
'album': 'Fearless'},
{'song': 'Sweet Nothing',
'accuracy': 77.09611452,
'daily_counts': 251738,
'historical_counts': 257572927,
'album': 'Midnights'},
{'song': 'Come In With the Rain',
'accuracy': 68.78504673,
'daily_counts': 45659,
'historical_counts': 54813332,
'album': 'Fearless'},
{'song': 'The Way I Loved You',
'accuracy': 78.53717026,
'daily_counts': 412971,
'historical_counts': 455196103,
'album': 'Fearless'},
{'song': 'long story short',
'accuracy': 73.36834209,
'daily_counts': 184930,
'historical_counts': 185028816,
'album': 'evermore'},
{'song': 'This Love',
'accuracy': 68.90380313,
'daily_counts': 350170,
'historical_counts': 336233263,
'album': '1989'},
{'song': 'The Other Side of the Door',
'accuracy': 70.26239067,
'daily_counts': 85428,
'historical_counts': 81717686,
'album': 'Fearless'},
{'song': 'evermore',
'accuracy': 72.20267417,
'daily_counts': 207050,
'historical_counts': 201903927,
'album': 'evermore'},
{'song': 'happiness',
'accuracy': 75.92982456,
'daily_counts': 154469,
'historical_counts': 175935158,
'album': 'evermore'},
{'song': 'Superstar',
'accuracy': 66.77115987,
'daily_counts': 39661,
'historical_counts': 48038335,
'album': 'Fearless'},
{'song': 'Change',
'accuracy': 71.11681643,
'daily_counts': 50221,
'historical_counts': 68624045,
'album': 'Fearless'},
{'song': 'Superman',
'accuracy': 70.61946903,
'daily_counts': 66989,
'historical_counts': 60867381,
'album': 'Speak Now'},
{'song': 'Invisible',
'accuracy': 60.04756243,
'daily_counts': 29572,
'historical_counts': 33388149,
'album': 'Taylor Swift'},
{'song': 'The Outside',
'accuracy': 60.14362657,
'daily_counts': 32047,
'historical_counts': 28461623,
'album': 'Taylor Swift'}]

function Dataland() {	

	// const accuracy_filter = 95;  // for the initial view, have min 95 accuracy;
	// const ltErasColors = ['eras_green', 'eras_gold', 'eras_purple', 'eras_lblue', 'eras_pink', 'eras_maroon', 'eras_indigo', 'eras_tan', 'eras_grey', 'eras_black'];

	const albumColorKey = {'Taylor_Swift': 'era-taylor-swift', 'Fearless': 'era-fearless', 'Speak_Now': 'era-speak-now', 'Red': 'era-red', '1989': 'era-1989', 'reputation': 'era-reputation', 'Lover': 'era-lover', 'folklore': 'era-folklore', 'evermore': 'era-evermore', 'Midnights': 'era-midnights'} as const

	const albumKeyLkup = { "Taylor Swift" : "Taylor_Swift", "Fearless" : "Fearless", "Speak Now" : "Speak_Now", 'Red' : 'Red', '1989' : '1989', 'reputation' : 'reputation', 'Lover' : 'Lover', 'folklore' : 'folklore', 'evermore' : 'evermore', 'Midnights' : 'Midnights'} as const

	const albumCovers = ["imtheproblem", "Taylor_Swift", "Fearless", "Speak_Now", "Red", "1989", "reputation", "Lover", "folklore", "evermore", "Midnights"] as const

	const accuracy_groups = [{key: 'gradeAplus', text: "A+"}, {key: 'gradeA', text: "A"}, {key: 'gradeB', text: " B "}, {key: 'gradeC', text: "C"}, {key: 'gradeD', text: "D"}, {key: 'gradeF', text: "F"}] as const
	
	const scrollRef = useRef<HTMLInputElement | null>(null)

	const [fighter, setFighter] = useState<AlbumArt>('imtheproblem')
	
	const [albumFilter, setAlbumFilter] = useState<AlbumArt>('imtheproblem')
	const [songFilter, setSongFilter] = useState<string>('')
	const [displayLyrics, setDisplayLyrics] = useState<LyricData[]>([])
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const [songList, setSongList] = useState<SongList[]>([])
	const [gettingLyrics, setGettingLyrics] = useState<boolean>(false)
	const [top40, setTop40] = useState<LyricData[]>([])
	const [showTop40, setShowTop40] = useState<boolean>(true)
	const [genViz, setGenViz] = useState<boolean>(false)

	function formatBigNumber(num: number) {
		if(num > 999 && num < 1000000){
				return (num/1000).toFixed(1) + 'K'; // convert to K for number from > 1000 < 1 million 
		} else if(num > 1000000000){
			return (num/1000000000).toFixed(1) + 'Bn'; // convert to M for number from > 1 B 
		} else if(num > 1000000){
				return (num/1000000).toFixed(1) + 'M'; // convert to M for number from > 1 million 
		} else if(num < 900){
				return num; // if value < 1000, nothing to do
		}
	}

	useEffect(() => {

		delayedDataFetch()
	
	}, [])

	useEffect(()=> {
		if (genViz){

			// spotify - accuracy scatter plot
		const t = d3.transition()
			.duration(2000)
			.delay((_, i) => i * 500)
			.ease(d3.easeBounceOut);		

		const h = 420
		const w = 420
		const margin = 30
		let yScale = d3.scaleLinear().domain([Math.max(...spotify_easy.map(x=> x.historical_counts))/1000000, Math.min(...spotify_easy.map(x=> x.historical_counts))/1000000]).range([margin, h - 1.5*margin])

		let xScale = d3.scaleLinear().domain([Math.min(...spotify_easy.map(x=> x.accuracy)), 100]).range([margin*2, w - 0.5*margin])

		let scatter = d3.select("#spotifyscatter").append('svg')
			.attr('class', 'spotify')
			.attr('height', h)
			.attr('width', w)
			.attr("viewBox", `0 0 ${h} ${w}`)

		let spotify = scatter.selectAll<SVGRectElement, SpotifyData>('circle').data(spotify_easy, function(d: SpotifyData) {
			return d.song
		})
		// cant seem to get transitions to work with mouseover with joins 
		// spotify.join(enter => (
		// 	enter.append('circle')
		// 		.attr('class', function(d) { return `${albumColorKey[albumKeyLkup[d.album as keyof typeof albumKeyLkup] as keyof typeof albumColorKey]}`
		// 		})				
		// 		.attr('r', '4')			
		// 		.on('mouseover', function(e, d) {
		// 			console.log(d.song)
		// 		})
		// 		.attr('cy', function(d){					
		// 			return yScale(d.historical_counts)
		// 		})
		// 		.attr('cx', function(d){					
		// 			return xScale(d.accuracy)
		// 		})
			
		// 	)
		// )
		
		spotify.enter().append('circle')
			.attr('class', function(d) { return `${albumColorKey[albumKeyLkup[d.album as keyof typeof albumKeyLkup] as keyof typeof albumColorKey]}`
			})									
			.on('mouseover', function(_, d) {
				const startY = 40
				const xPos = 60

				d3.select('.spotify').append('text')
				.attr('class', 'hoverlabel')
				.attr('x', xPos)
				.attr('y', startY)
				.attr('font-size', '14px')
				.text(d.song)

				d3.select('.spotify').append('text')
				.attr('class', 'hoverlabel')
				.attr('x', xPos)
				.attr('y', startY + 20)
				.attr('font-size', '14px')
				.text(`Total Plays on Spotify: ${formatBigNumber(d.historical_counts)}`)

				d3.select('.spotify').append('text')
				.attr('class', 'hoverlabel')
				.attr('x', xPos)
				.attr('y', startY + 40)
				.attr('font-size', '14px')
				.text(`Accuracy: ${(d.accuracy).toFixed(1)}%`)

			})
			.on('mouseout', function(){
				d3.selectAll('.hoverlabel').remove()
			})
			.attr('cx', 0)  // make bounce look like spray bottle 
			.attr('cy', h)
			.transition(t)
			.attr('r', '5')				
			.attr('cy', function(d){					
				return yScale(d.historical_counts/1000000)
			})
			.attr('cx', function(d){					
				return xScale(d.accuracy)
			})

		d3.select('.spotify').append('g')
			.attr('transform', `translate(0, ${h - margin})`)
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

		// let transform
		// const zoom = d3.zoom().on("zoom", e => {
		// 	scatter.append('g')
		// 	.attr("transform", (transform = e.transform))
		// 	.style("stroke-width", 3 / Math.sqrt(transform.k));
		// 	console.log(transform)
		// 	d3.selectAll('circle').attr("r", 3 / Math.sqrt(transform.k));
		// });

		// scatter.call(zoom)
		// 	.call(zoom.transform, d3.zoomIdentity)

		// scatter.call(d3.brush().on("start brush end", ({selection}) => {
		// 	let value = [];
		// 	if (selection) {
		// 		const [[x0, y0], [x1, y1]] = selection;
		// 		// value = dot
		// 		// 	.style("stroke", "gray")
		// 		// 	// .filter(d => x0 <= x(d["Miles_per_Gallon"]) && x(d["Miles_per_Gallon"]) < x1
		// 		// 	// 				&& y0 <= y(d["Horsepower"]) && y(d["Horsepower"]) < y1)
		// 		// 	.style("stroke", "steelblue")
		// 		// 	.data();
		// 	} else {
		// 		dot.style("stroke", "steelblue");
		// 	}

		}
		
			
		
	}, [genViz])

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
				if (d.lyric.length > 53){
					// need two rows for long lines, can't use height to 100% if want any transitions tho
					return '54px'  
				} else {
					return '30px'
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
				if (d.lyric.length > 53){
					// need two rows for long lines, can't use height to 100% if want any transitions tho
					return '54px'  
				} else {
					return '30px'
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
					// ${(d.accuracy_group == 'gradeA' || d.accuracy_group == 'gradeAplus') ? `albumColorKey[d.album_key as keyof typeof albumColorKey]-${d.accuracy_group}` : d.accuracy_group == 'gradeB' ? `${albumColorKey[d.album_key as keyof typeof albumColorKey]}-B` : d.accuracy_group == 'gradeC' ? `${albumColorKey[d.album_key as keyof typeof albumColorKey]}-C` : (d.accuracy_group == 'gradeD' || d.accuracy_group == 'gradeF') ? `${albumColorKey[d.album_key as keyof typeof albumColorKey]}-fail` : ''} ${albumColorKey[d.album_key as keyof typeof albumColorKey]}		
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

		// axios.get(`http://localhost:3000/getFullLyricsNStats`)
		// // axios.get(`https://swift-api.fly.dev/getFullLyricsNStats`)
		// .then(function (response) {								
		// 	fullLyricsNStats = response.data.fullLyricsNStats
		// 	setSongFilter('Anti-Hero')
		// 	console.log(fullLyricsNStats)
		// })
		// .catch(function (error) {				
		// 	console.log(error);
		// });	

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
				<h2>Grabbing the Data!</h2>
					<iframe src="/icons/tswift running.gif" width="480" height="200" frameBorder="0" className="giphy-embed" allowFullScreen></iframe><p><a href="/icons/tswift running.gif"></a></p></div>}
				{!isLoading && <div className='grid grid-cols-1 p-2 justify-items-center mt-20 lg:ml-8 lg:mr-8 sm:ml-2 sm:mr-2 justify-center'>
				
				<div className=''>
					<img src={title} className='mx-auto logo p-4 max-h-32' alt="Swift AF" />				
				</div>	
				
				<div>
					<div className='flex flex-row flex-wrap justify-center'>					
					{albumCovers.map(x=> <img src={`/icons/${x}.jpg`} key={x} className ={`albums ${fighter != x ? 'faded' : fighter == x ? 'selected' : ''}`} onClick={()=> {
						changeViz(x)						
						}}></img>)}					
					</div>	
				</div>

				{<div>					
						{gettingLyrics && 
						<div>
							<h2>Grabbing the Data!</h2>
							<iframe src="/icons/tswift running.gif" width="480" height="200" frameBorder="0" className="giphy-embed" allowFullScreen></iframe><p><a href="/icons/tswift running.gif"></a></p>
						</div>}
						
					</div>}
						
				{/* legend for album */}
				{!gettingLyrics && !showTop40 && displayLyrics && 
				<div>
					<h6>Click the legend to filter the lyrics.</h6>
					<div className='flex flex-row flex-wrap justify-center'>		
				
						{accuracy_groups.map(x => 
							<div key={x.key} className={`legend ${x.key} 							
							${albumColorKey[fighter as keyof typeof albumColorKey]}-${x.key}`}
							>{x.text}</div>)}
							{/* ${highlightGroup == x.key ? 'underline selected' : 'faded' }  */}
						
					</div>
				</div>}			

				{/* lyrics data viz by song  */}
				<div className='flex flex-row flex-wrap justify-center'>
					{!gettingLyrics && !showTop40 && displayLyrics && <div>
						{songList.map((x)=> 
						<div onClick={() => { 
							setSongFilter(x.song);
							setDisplayLyrics(fullLyricsNStats.filter(s=> s.song == x.song));
							// scroll to top of data viz, buffer for nav bar on mobile
							window.scrollTo({top: scrollRef.current ? scrollRef.current?.offsetTop - 95 : 0, behavior: 'smooth'})							
						}}
						className={`cursor-pointer rounded-t-xl rounded-b-xl text-center m-2 p-1 pl-3 pr-3 text-m font-bold ${albumColorKey[x.album_key as keyof typeof albumColorKey]} ${songFilter == x.song ? 'selected' : 'faded'}`}
						key={`${x.song}`}
							>{x.song}</div>)}
					</div>}					
					
					{showTop40 && <div>
						<h2>Long Live the Swiftest Top 40</h2>
						<h5>Most quickly identified lyrics with 95+% accuracy–do you recognize all of them? Click the covers to see the top lyrics by album. </h5>
						<h6>Hover over the lyric to reveal the song!</h6>
						<div id='top40VizAns'>
							{/* <svg id='top40Viz'></svg> */}
							{/* <svg viewBox="0 0 100 200"
							ref={top40ref}></svg> */}
						</div>
						<div id='top40Viz'>
						</div>

						
						
						<div className='wrapper'>
							<h2>We Forgot These Existed</h2>
							<div id='bottom40VizAns'>							
							</div>
							<div id='bottom40Viz'>
							</div>
						</div>	
						<div className='wrapper'>
						{/* <h6>Are the most recognized songs also the most popular songs? </h6> */}
						<InView as="div" 
							threshold={0}
							onChange={(inView) => {
							if (inView) {
								setGenViz(true)
							}}}><h6>Are the songs with the most recognized lyrics also the most popular songs? Hover/click on a circle to see play counts vs accuracy.</h6></InView> 
						<div id='spotifyscatter' ></div>
						</div>

					</div>}

					{!showTop40 && <div>
						<div id='lyricalViz' ref={scrollRef}></div>
					</div>}
					
				</div>
					
				
				
			</div>}
		</>
	)

}

export default Dataland