import React from 'react';

import './button.scss';

interface ButtonProps {
	label: string;
}

class Button extends React.Component<ButtonProps, {}> {
	constructor(props: ButtonProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='button-container'>
				<p className='button-label'>{this.props.label}</p>
			</div>
		);
	}
}
export default Button;
