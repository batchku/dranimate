

import React from 'react';

import './icon-style.scss';

interface CancelIconProps {
	fill: string;
	opacity: string;
}

export default class CancelIcon extends React.Component<CancelIconProps, {}> {
	public render = (): JSX.Element => {
		return (
			<div className='icon-container'>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M3.51468 3.51468C2.97395 4.0554 2.97395 4.93209 3.51468 5.47282L10.0418 12L3.51468 18.5271C2.97395 19.0678 2.97395 19.9445 3.51468 20.4852C4.0554 21.026 4.93209 21.026 5.47282 20.4852L12 13.9581L18.5271 20.4852C19.0678 21.026 19.9445 21.026 20.4852 20.4852C21.026 19.9445 21.026 19.0678 20.4852 18.5271L13.9581 12L20.4852 5.47282C21.026 4.93209 21.026 4.0554 20.4852 3.51468C19.9445 2.97395 19.0678 2.97395 18.5271 3.51468L12 10.0418L5.47282 3.51468C4.93209 2.97395 4.0554 2.97395 3.51468 3.51468Z"
						fill={this.props.fill}
						fillOpacity={this.props.opacity}
					/>
				</svg>
			</div>
		);
	}
}
