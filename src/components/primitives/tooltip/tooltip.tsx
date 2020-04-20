import React from 'react';

import Typography, {TypographyVariant} from './../../typography/typography';

import './tooltip.scss';

interface TooltipProps {
	text: string;
	open: boolean;
	onClose: () => void;
}

class Tooltip extends React.Component<TooltipProps, {}> {
	constructor(props: TooltipProps) {
		super(props);

		this.state = {
			showTooltip: false,
			mouseOver: false,
		};
	}

	public render = (): JSX.Element[] => {
		if (!this.props.open) {
			return null;
		}

		return ([
			<div key='tooltip-body' className='tooltip'>
				<div className='tooltip-text-container'>
					<Typography variant={TypographyVariant.TEXT_SMALL} color='#FFFFFF'>
						{this.props.text}
					</Typography>
				</div>
				<div className='tooltip-divider' />
				<div className='tooltip-close-button-container'>
					<img className='tooltip-close-button' src='./assets/close-white.svg' onClick={this.props.onClose} />
				</div>
			</div>,
			<div key='tooltip-arrow' className='tooltip-arrow-down' />
		]);
	}
}
export default Tooltip;
