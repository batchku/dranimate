import React, { FC } from 'react';

import './icon-style.scss';

interface PauseIconProps {
	fill: string;
	opacity: string;
}

const PauseIcon: FC<PauseIconProps> = (props) => {
	return (
		<div className='icon-container'>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M14 7C14 6.44771 14.4477 6 15 6C15.5523 6 16 6.44772 16 7V17C16 17.5523 15.5523 18 15 18C14.4477 18 14 17.5523 14 17V7Z" fill={props.fill} fillOpacity={props.opacity} />
			<path d="M9 6C8.44771 6 8 6.44771 8 7V17C8 17.5523 8.44771 18 9 18C9.55229 18 10 17.5523 10 17V7C10 6.44772 9.55229 6 9 6Z" fill={props.fill} fillOpacity={props.opacity} />
			<path fillRule="evenodd" clipRule="evenodd" d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill={props.fill} fillOpacity={props.opacity} />
		</svg>
		</div>
	);
}
export default PauseIcon;
