

import React, { FC } from 'react';

import './icon-style.scss';

interface StopIconProps {
	fill: string;
	opacity: string;
}

const StopIcon: FC<StopIconProps> = (props) => {
	return (
		<div className='icon-container'>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path fillRule="evenodd" clipRule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM17 7H7V17H17V7Z" fill={props.fill} fillOpacity={props.opacity}/>
			</svg>
		</div>
	);
}
export default StopIcon;
