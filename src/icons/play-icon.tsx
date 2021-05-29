

import React, { FC } from 'react';

import './icon-style.scss';

interface PlayIconProps {
	fill: string;
	opacity: string;
}

const PlayIcon: FC<PlayIconProps> = (props: PlayIconProps): JSX.Element => {
	return (
		<div className='icon-container'>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M10.267 7.13493L16.6281 11.3199C17.124 11.6458 17.124 12.3532 16.6281 12.6801L10.267 16.8651C9.74322 17.2186 9 16.8375 9 16.1856V7.81439C9 7.16253 9.71634 6.78139 10.267 7.13493Z" fill={props.fill} fillOpacity={props.opacity} />
				<path fillRule="evenodd" clipRule="evenodd" d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" fill={props.fill} fillOpacity={props.opacity} />
			</svg>
		</div>
	);
}
export default PlayIcon;
