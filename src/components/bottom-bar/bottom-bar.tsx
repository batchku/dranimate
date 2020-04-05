import React from 'react';

import AddPuppet from 'components/add-puppet/add-puppet';
import ContentButton from 'components/primitives/content-button/content-button';
import Icon, {IconSize} from 'components/primitives/icon/icon';
import Spacer from 'components/primitives/spacer/spacer';

import dranimate from 'services/dranimate/dranimate';

import './bottom-bar.scss';

interface BottomBarState {
	handTrackingEnabled: boolean;
}

class BottomBar extends React.Component<{}, BottomBarState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			handTrackingEnabled: false,
		};
	}

	public render(): JSX.Element {
		return (
			<div className='bottom-bar-container'>
				<div className='bottom-bar-items'>
					<ContentButton>
						<Icon url='./assets/camera.svg'/>
					</ContentButton>
					<Spacer size={12} />
					<ContentButton>
						<Icon url='./assets/gif.svg'/>
					</ContentButton>
					<Spacer size={12} />
					<ContentButton
						onClick={this.onToggleHandTracking}
						label={this.state.handTrackingEnabled ? 'Stop hand detection' : 'Start hand detection'}
					>
						{!this.state.handTrackingEnabled && <Icon url='./assets/play.svg' size={IconSize.SMALL} />}
						{this.state.handTrackingEnabled && <Icon url='./assets/stop.svg' size={IconSize.SMALL} />}
					</ContentButton>
				</div>
				<AddPuppet />
			</div>
		);
	}

	private onToggleHandTracking = (): void => {
		this.setState({
			handTrackingEnabled: !this.state.handTrackingEnabled
		}, () => {
			dranimate.setHandTrackingEnabled(this.state.handTrackingEnabled);
		});
	}
}
export default BottomBar;
