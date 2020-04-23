import React from 'react';

import Typography, { TypographyVariant } from './../../typography/typography';

import './border-button.scss';

interface BorderButtonProps {
	label: string;
	color?: string;
	disabledColor?: string;
	fullWidth?: boolean;
	width?: number;
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

		let buttonWidth = '';
		if (this.props.fullWidth) {
			buttonWidth = '100%';
		}
		if (this.props.width) {
			buttonWidth = `${this.props.width}px`;
		}

		return (
			<div
				style={{
					borderColor: color || 'rgba(0, 0, 0, 0.6)',
					width: buttonWidth,
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
