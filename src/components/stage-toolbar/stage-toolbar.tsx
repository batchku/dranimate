import React from 'react';

import IconButton, { TooltipSide } from './../primitives/icon-button/icon-button';
import Icon from './../primitives/icon/icon';

import dranimate from './../../services/dranimate/dranimate';

import './stage-toolbar.scss';

interface StageToolbarState {
	panEnabled: boolean;
}

class StageToolbar extends React.Component<{}, StageToolbarState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			panEnabled: false,
		};
	}

	public render = (): JSX.Element => {
		return (
			<div className='stage-toolbar-container'>
				<IconButton tooltip='Pan' tooltipPosition={TooltipSide.LEFT} onClick={this.onTogglePan} active={this.state.panEnabled}>
					<Icon url='./assets/pan.svg' />
				</IconButton>
				<IconButton tooltip='Zoom in' tooltipPosition={TooltipSide.LEFT} onClick={this.onZoomIn}>
					<Icon url='./assets/zoom-in.svg' />
				</IconButton>
				<IconButton tooltip='Zoom out' tooltipPosition={TooltipSide.LEFT} onClick={this.onZoomOut}>
					<Icon url='./assets/zoom-out.svg' />
				</IconButton>
			</div>
		);
	}

	private onTogglePan = (): void => {
		this.setState({
			panEnabled: !this.state.panEnabled
		}, () => {
			dranimate.setPanEnabled(this.state.panEnabled);
		});
	}

	private onZoomIn = (): void => {
		dranimate.zoomIn();
	}

	private onZoomOut = (): void => {
		dranimate.zoomOut();
	}
}
export default StageToolbar;
