import React from 'react';

import Typography, { TypographyVariant } from './../../typography/typography';

import './borderless-button.scss';

interface BorderlessButtonProps {
	label: string;
	color?: {
		red: number;
		green: number;
		blue: number;
	};
	disabled?: boolean;
	onClick?: () => void;
}

class BorderlessButton extends React.Component<BorderlessButtonProps, {}> {
	constructor(props: BorderlessButtonProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		const opacity = this.props.disabled ? 0.6 : 0.3;

		return (
			<div className='borderless-button-container' onClick={this.props.onClick}>
				<Typography
					variant={TypographyVariant.HEADING_MEDIUM}
					color={`rgba(${this.props.color.red || 0}, ${this.props.color.green || 0}, ${this.props.color.blue || 0}, ${opacity})`}
				>
					{this.props.label}
				</Typography>
			</div>
		);
	}
}
export default BorderlessButton;
