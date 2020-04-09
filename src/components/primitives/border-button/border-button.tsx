import React from 'react';

import Typography, { TypographyVariant } from './../../typography/typography';

import './border-button.scss';

interface BorderButtonProps {
	label: string;
	color?: string;
	fullWidth?: boolean;
	onClick?: () => void;
}

class BorderButton extends React.Component<BorderButtonProps, {}> {
	constructor(props: BorderButtonProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div
				style={{
					borderColor: this.props.color || 'rgba(0, 0, 0, 0.6)',
					width: this.props.fullWidth ? '100%' : '',
				}}
				className='border-button-container'
				onClick={this.props.onClick}
			>
				<Typography variant={TypographyVariant.HEADING_MEDIUM} color={this.props.color || 'rgba(0, 0, 0, 0.6)'}>
					{this.props.label}
				</Typography>
			</div>
		);
	}
}
export default BorderButton;
