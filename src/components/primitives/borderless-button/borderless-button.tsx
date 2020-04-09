import React from 'react';

import Typography, { TypographyVariant } from './../../typography/typography';

import './borderless-button.scss';

interface BorderlessButtonProps {
	label: string;
	color?: string;
	onClick?: () => void;
}

class BorderButton extends React.Component<BorderlessButtonProps, {}> {
	constructor(props: BorderlessButtonProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='borderless-button-container' onClick={this.props.onClick}>
				<Typography variant={TypographyVariant.HEADING_MEDIUM} color={this.props.color || 'rgba(0, 0, 0, 0.6)'}>
					{this.props.label}
				</Typography>
			</div>
		);
	}
}
export default BorderButton;
