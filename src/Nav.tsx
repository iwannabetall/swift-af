// import {
//   FacebookShareButton,  
// 	FacebookIcon,
//   FacebookMessengerIcon,
//   FacebookMessengerShareButton,
// 	TumblrIcon,
//   TumblrShareButton,
//   TwitterShareButton,
// 	XIcon,
// 	WhatsappIcon,
//   WhatsappShareButton,
// 	TelegramIcon,
//   TelegramShareButton,
// } from "react-share";

export default function Nav({ location } : {location: {pathname: string}}){

	// const shareUrl = 'https://swift-af.com/' as const
	// const title = "im swift af boi. are you??"
	// const size = 24
	
	const paths = [{key: '/', value: 'Home'}, {key: '/answers', value: 'Question...?'}, {key: '/leaderboard', value: "This is why we can't have nice things"}] as const; 

	return (
		<div className="era-reputation left-0">
			<nav className="era-reputation min-w-full fixed p-2 top-0 block justify-between mx-auto">
				<ul className='flex flex-row flex-wrap'>
					{paths.map(x=> <li key={x.key} className={`era-reputation inline ml-1 mr-1 p-1 ${location.pathname == x.key ? 'underline' :'faded'}`}><a className="color-white" href={x.key}>{location.pathname == '/' && x.value == 'Home' ? 'Begin' : x.value == 'Home' ? 'Begin Again' : x.value}</a></li>)}					
				</ul>
				
			</nav>

			{/* <div className = 'fixed bottom-0 era-reputation left-0m in-w-full fixed p-2'>
				Challenge your friends 
				<FacebookShareButton
          url={shareUrl}
          className="inline mr-2"
        >
				<FacebookIcon size={size} round />
        </FacebookShareButton>
				<WhatsappShareButton
          url={shareUrl}
          title={title}
          separator=":: "
          className="inline mr-2"
        >
          <WhatsappIcon size={size} round />
        </WhatsappShareButton>
				<TwitterShareButton
          url={shareUrl}
          title={title}
          className="inline mr-2"
        >
          <XIcon size={size} round />
        </TwitterShareButton>
				<FacebookMessengerShareButton
          url={shareUrl}
          appId="521270401588372"
          className="inline mr-2"
        >
          <FacebookMessengerIcon size={size} round />
        </FacebookMessengerShareButton>
				<TumblrShareButton
          url={shareUrl}
          title={title}
          className="inline mr-2"
        >
          <TumblrIcon size={size} round />
        </TumblrShareButton>

				<TelegramShareButton
          url={shareUrl}
          title={title}
          className="Demo__some-network__share-button"
        >
          <TelegramIcon size={size} round />
        </TelegramShareButton>

			</div> */}
		</div>	
	)
	
}