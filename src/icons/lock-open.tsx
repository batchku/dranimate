

import React, { FC } from 'react';

import './icon-style.scss';

interface LockOpenIconProps {
	fill: string;
	opacity: string;
}

const LockOpenIcon: FC<LockOpenIconProps> = (props) => {
	return (
		<div className='icon-container'>
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g clipPath="url(#clip0)">
					<path fillRule="evenodd" clipRule="evenodd" d="M6.13039 9.39163V5.26159C6.13039 2.35613 8.69927 0.000610352 11.8697 0.000610352C15.0391 0.000610352 17.609 2.35816 17.609 5.26159V5.67307C17.609 6.0534 17.3932 6.40081 17.0523 6.56942L16.9647 6.61274C16.3001 6.94147 15.5214 6.45788 15.5214 5.71639V5.26159C15.5214 3.55262 13.9239 2.08817 11.8697 2.08817C9.81342 2.08817 8.21793 3.55062 8.21793 5.26159V9.39163H15.5214H17.609H18.7731C19.8589 9.39163 20.7393 10.3278 20.7393 11.4772V21.915C20.7393 23.0664 19.8589 24.0006 18.7731 24.0006H4.96625C3.88043 24.0006 3 23.0644 3 21.915V11.4772C3 10.3258 3.8804 9.39163 4.96625 9.39163H6.13039ZM5.08759 21.913V11.4792H18.6517V21.913H5.08759Z" fill={props.fill} />
					<path d="M10.8259 15.4274C10.8259 14.8512 11.2896 14.3846 11.8697 14.3846C12.4458 14.3846 12.9134 14.8473 12.9134 15.4274V18.5588C12.9134 19.135 12.4497 19.6016 11.8697 19.6016C11.2935 19.6016 10.8259 19.1389 10.8259 18.5588V15.4274Z" fill={props.fill} />
				</g>
			<defs>
				<clipPath id="clip0">
					<rect width="24" height="24" fill={props.fill} transform="translate(0 0.000610352)"/>
				</clipPath>
			</defs>
			</svg>
		</div>
	);
}
export default LockOpenIcon;
