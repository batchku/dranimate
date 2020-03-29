import React, { Component } from 'react';

import Button from 'components/primitives/button';

import dranimate from 'services/dranimate/dranimate';

import styles from './styles.scss';

class HandTrackingToolbar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			trackingEnabled: true,
		};
	}

	/**
	 * Used to turn hand tracking on/off.
	 */
	onTrackingToggle = () => {
		this.setState({
			trackingEnabled: !this.state.trackingEnabled
		}, () => {
			dranimate.setHandTrackingEnabled(this.state.trackingEnabled);
		});
	};

	render() {
		return (
			<div>
				<Button
					className={styles.toggleTrackingButton}
					onClick={this.onTrackingToggle}
				>
					{ this.state.trackingEnabled ? 'Stop tracking hand' : 'Start tracking hand' }
				</Button>
			</div>
		);
	}
}

export default HandTrackingToolbar;
