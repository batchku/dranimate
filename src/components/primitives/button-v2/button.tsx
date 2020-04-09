import React from 'react';

import './button.scss';

interface ButtonProps {
	label: string;
	onClick?: () => void;
}

class Button extends React.Component<ButtonProps, {}> {
	constructor(props: ButtonProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='button-container' onClick={this.props.onClick}>
				<p className='button-label'>{this.props.label}</p>
			</div>
		);
	}
}
export default Button;
