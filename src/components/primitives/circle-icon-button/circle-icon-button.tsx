import React from 'react';

import './circle-icon-button.scss';

interface CircleIconButtonProps {
	iconUrl: string;
	active?: boolean;
	onClick?: () => void;
}

class CircleIconButton extends React.Component<CircleIconButtonProps, {}> {
	constructor(props: CircleIconButtonProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div style={{
				background: this.props.active ? '#4A73E2' : 'rgba(0, 0, 0, 0)'
			}} className='circle-icon-button-container' onClick={this.props.onClick}>
				<img src={this.props.iconUrl} />
			</div>
		);
	}
}
export default CircleIconButton;
