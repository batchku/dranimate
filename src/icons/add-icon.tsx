import React from 'react';

import './icon-style.scss';

interface AddIconProps {
	fill: string;
	opacity: string;
}

export default class AddIcon extends React.Component<AddIconProps, {}> {
	public render = (): JSX.Element => {
		return (
			<div className='icon-container'>
				<svg width='25' height='24' viewBox='0 0 25 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
					<path
						d='M12.5 0C11.7353 0 11.1154 0.619913 11.1154 1.38461V10.6154H1.88462C1.11991 10.6154 0.5 11.2353 0.5 12C0.5 12.7647 1.11991 13.3846 1.88461 13.3846H11.1154V22.6154C11.1154 23.3801 11.7353 24 12.5 24C13.2647 24 13.8846 23.3801 13.8846 22.6154V13.3846H23.1154C23.8801 13.3846 24.5 12.7647 24.5 12C24.5 11.2353 23.8801 10.6154 23.1154 10.6154H13.8846V1.38462C13.8846 0.619914 13.2647 0 12.5 0Z'
						fill={this.props.fill}
						fillOpacity={this.props.opacity}
					/>
				</svg>
			</div>
		);
	}
}
