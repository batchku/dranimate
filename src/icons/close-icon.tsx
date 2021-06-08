



import React, { FC } from 'react';

import './icon-style.scss';

interface CloseIconProps {
	fill: string;
	opacity: string;
}

const CloseIcon: FC<CloseIconProps> = (props) => {
	return (
		<div className='icon-container'>
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M2.05155 0.35199C1.58223 -0.11733 0.82131 -0.11733 0.35199 0.35199C-0.11733 0.82131 -0.117329 1.58223 0.351991 2.05155L6.30044 8L0.35199 13.9485C-0.11733 14.4178 -0.11733 15.1787 0.35199 15.648C0.82131 16.1173 1.58223 16.1173 2.05155 15.648L8 9.69956L13.9485 15.648C14.4178 16.1173 15.1787 16.1173 15.648 15.648C16.1173 15.1787 16.1173 14.4178 15.648 13.9485L9.69956 8L15.648 2.05155C16.1173 1.58223 16.1173 0.82131 15.648 0.35199C15.1787 -0.11733 14.4178 -0.11733 13.9485 0.351991L8 6.30044L2.05155 0.35199Z" fill={props.fill} fillOpacity={props.opacity} />
			</svg>
		</div>
	);
}
export default CloseIcon;
