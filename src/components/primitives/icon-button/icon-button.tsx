import React from 'react';

import Typography, {TypographyVariant} from './../../typography/typography';

import './icon-button.scss';

export enum TooltipSide {
	LEFT = 'left',
	BOTTOM = 'bottom',
}

interface IconButtonProps {
	onClick?: () => void;
	tooltip?: string;
	tooltipPosition?: TooltipSide;
	active?: boolean;
	disabled?: boolean;
}

interface IconButtonState {
	showTooltip: boolean;
	mouseOver: boolean;
}

class IconButton extends React.Component<IconButtonProps, IconButtonState> {
	constructor(props: IconButtonProps) {
		super(props);

		this.state = {
			showTooltip: false,
			mouseOver: false,
		};
	}

	public render = (): JSX.Element => {
		let backgroundColor = 'rgba(0, 0, 0, 0.3)';
		if (this.state.mouseOver) {
			backgroundColor = 'rgba(0, 0, 0, 0.9)';
		}
		if (this.props.active) {
			backgroundColor = 'rgba(74, 115, 226, 1)';
		}

		return (
			<div
				style={{
					background: backgroundColor,
					cursor: this.props.disabled ? 'auto' : 'pointer'
				}}
				className='icon-button-container'
				onClick={this.onClick}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
			>
				{this.props.children}
				{this.props.tooltip && this.state.showTooltip && [
					<div key='tooltip-body' className={`icon-button-tooltip-${this.props.tooltipPosition || TooltipSide.BOTTOM}`}>
						<Typography variant={TypographyVariant.TEXT_X_SMALL} color='#FFFFFF'>
							{this.props.tooltip}
						</Typography>
					</div>,
					<div key='tooltip-arrow' className={`arrow-${this.props.tooltipPosition || TooltipSide.BOTTOM}`} />
				]}
			</div>
		);
	}

	private onClick = (): void => {
		if (this.props.disabled) {
			return;
		}
		this.props.onClick();
	}

	private onMouseEnter = (): void => {
		if (this.props.disabled) {
			return;
		}

		this.setState({
			showTooltip: true,
			mouseOver: true,
		});
	}

	private onMouseLeave = (): void => {
		this.setState({
			showTooltip: false,
			mouseOver: false,
		});
	}
}
export default IconButton;
