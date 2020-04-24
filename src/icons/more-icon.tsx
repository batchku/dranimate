import React from 'react';

import './icon-style.scss';

interface MoreIconProps {
	fill: string;
	opacity: string;
}

export default class MoreIcon extends React.Component<MoreIconProps, {}> {
	public render = (): JSX.Element => {
		return (
			<div className='icon-container'>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						fillRule='evenodd'
						clipRule='evenodd'
						d='M5 12C5 10.8954 5.89543 10 7 10C8.10457 10 9 10.8954 9 12C9 13.1046 8.10457 14 7 14C5.89543 14 5 13.1046 5 12ZM10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12ZM15 12C15 10.8954 15.8954 10 17 10C18.1046 10 19 10.8954 19 12C19 13.1046 18.1046 14 17 14C15.8954 14 15 13.1046 15 12Z'
						fill={this.props.fill}
						fillOpacity={this.props.opacity}
					/>
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
						fill={this.props.fill}
						fillOpacity={this.props.opacity}
					/>
				</svg>
			</div>
		);
	}
}
