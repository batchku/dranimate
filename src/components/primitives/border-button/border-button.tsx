import React from 'react';

import Typography, { TypographyVariant } from './../../typography/typography';

import './border-button.scss';

interface BorderButtonProps {
	label: string;
	color?: string;
	disabledColor?: string;
	fullWidth?: boolean;
	disabled?: boolean;
	onClick?: () => void;
}

class BorderButton extends React.Component<BorderButtonProps, {}> {
	constructor(props: BorderButtonProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		let color = this.props.color;
		if (this.props.disabled) {
			color = this.props.disabledColor;
		}

		return (
			<div
				style={{
					borderColor: color || 'rgba(0, 0, 0, 0.6)',
					width: this.props.fullWidth ? '100%' : '',
				}}
				className='border-button-container'
				onClick={this.onClick}
			>
				<Typography variant={TypographyVariant.HEADING_MEDIUM} color={color || 'rgba(0, 0, 0, 0.6)'}>
					{this.props.label}
				</Typography>
			</div>
		);
	}

	private onClick = (): void => {
		if (this.props.disabled) {
			return;
		}
		this.props.onClick();
	}
}
export default BorderButton;
