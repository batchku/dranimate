import React from 'react';

import './finger-label.scss';

interface FingerLabelProps {
	label: string;
	highlighted: boolean;
	placed: boolean;
	position: {
		left: string;
		top: string;
	};
}

class FingerLabel extends React.Component<FingerLabelProps, {}> {
	constructor(props: FingerLabelProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		let textColor = '#4A73E2';
		if (this.props.highlighted) {
			textColor = '#FFFFFF';
		}
		if (this.props.placed) {
			textColor = 'rgba(0, 0, 0, 0.6)'
		}

		return (
			<div style={{
				position: 'absolute',
				left: this.props.position.left,
				top: this.props.position.top,
				background: this.props.highlighted ? '#4A73E2' : '#F3F5FA',
				borderColor: this.props.placed ? 'rgba(0, 0, 0, 0.8)' : '#4A73E2',
			}} className='finger-label-container'>
				<p style={{
					color: textColor
				}} className='finger-label-text'>
					{this.props.label}
				</p>
			</div>
		);
	}
}
export default FingerLabel;
