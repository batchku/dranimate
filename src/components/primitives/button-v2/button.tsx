import React from 'react';

import './button.scss';
import Typography, { TypographyVariant } from 'components/typography/typography';

interface ButtonProps {
	label: string;
	onClick?: () => void;
	fullWidth?: boolean;
	disabled?: boolean;
	width?: number;
}

class Button extends React.Component<ButtonProps, {}> {
	constructor(props: ButtonProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		let buttonClasses = 'button-container';
		if (this.props.disabled) {
			buttonClasses += ' button-disabled';
		}

		let buttonWidth = '';
		if (this.props.fullWidth) {
			buttonWidth = '100%';
		}
		if (this.props.width) {
			buttonWidth = `${this.props.width}px`;
		}

		return (
			<div style={{
				width: buttonWidth,
			}} className={buttonClasses} onClick={this.onClick}>
				<Typography variant={TypographyVariant.HEADING_MEDIUM} color='#FFFFFF'>
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
export default Button;
