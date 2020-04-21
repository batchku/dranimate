import React from 'react';

import AddPuppet from 'components/add-puppet/add-puppet';
import ContentButton from 'components/primitives/content-button/content-button';
import Spacer from 'components/primitives/spacer/spacer';
import Tooltip from 'components/primitives/tooltip/tooltip';
import Icon, {IconSize} from 'components/primitives/icon/icon';

import dranimate from 'services/dranimate/dranimate';

import './bottom-bar.scss';

interface BottomBarState {
	handTrackingEnabled: boolean;
	handTrackingTooltipVisible: boolean;
}

class BottomBar extends React.Component<{}, BottomBarState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			handTrackingEnabled: false,
			handTrackingTooltipVisible: true,
		};
	}

	public render(): JSX.Element {
		return (
			<div className='bottom-bar-container'>
				<div className='bottom-bar-items'>
					<ContentButton>
						<Icon url='./assets/gif.svg'/>
					</ContentButton>
					<Spacer size={12} />
					<div style={{position: 'relative'}}>
						<ContentButton
							onClick={this.onToggleHandTracking}
							label={this.state.handTrackingEnabled ? 'Stop hand detection' : 'Start hand detection'}
						>
							{!this.state.handTrackingEnabled && <Icon url='./assets/play.svg' size={IconSize.SMALL} />}
							{this.state.handTrackingEnabled && <Icon url='./assets/stop.svg' size={IconSize.SMALL} />}
						</ContentButton>
						<Tooltip
							text='Give your webcam access to animate your puppet using your hands'
							open={this.state.handTrackingTooltipVisible}
							onClose={this.onCloseHandTrackingTooltip}
						/>
					</div>
				</div>
				<AddPuppet />
			</div>
		);
	}

	private onToggleHandTracking = (): void => {
		this.setState({
			handTrackingEnabled: !this.state.handTrackingEnabled,
			handTrackingTooltipVisible: false,
		}, () => {
			dranimate.setHandTrackingEnabled(this.state.handTrackingEnabled);
		});
	}

	private onCloseHandTrackingTooltip = (): void => {
		this.setState({
			handTrackingTooltipVisible: false,
		});
	}
}
export default BottomBar;
