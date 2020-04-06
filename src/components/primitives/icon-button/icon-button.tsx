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
}

interface IconButtonState {
	showTooltip: boolean;
}

class IconButton extends React.Component<IconButtonProps, IconButtonState> {
	constructor(props: IconButtonProps) {
		super(props);

		this.state = {
			showTooltip: false,
		};
	}

	public render = (): JSX.Element => {
		return (
			<div
				style={{
					background: this.props.active ? 'rgba(74, 115, 226, 1)' : 'rgba(0, 0, 0, 0.3)'
				}}
				className='icon-button-container'
				onClick={this.props.onClick}
				onMouseEnter={this.onShowTooltip}
				onMouseLeave={this.onHideTooltip}
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

	private onShowTooltip = (): void => {
		this.setState({
			showTooltip: true,
		});
	}

	private onHideTooltip = (): void => {
		this.setState({
			showTooltip: false,
		});
	}
}
export default IconButton;
