import React from 'react';

import './button.scss';

interface ButtonProps {
	label: string;
	onClick?: () => void;
	fullWidth?: boolean;
	disabled?: boolean;
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

		return (
			<div style={{
				width: this.props.fullWidth ? '100%' : '',
			}} className={buttonClasses} onClick={this.onClick}>
				<p className='button-label'>{this.props.label}</p>
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
