import React, { Component } from 'react';

import Button from 'components/primitives/button';

import dranimate from 'services/dranimate/dranimate';
import eventManager from '../../services/eventManager/event-manager';

import './styles.scss';

class HandTrackingToolbar extends Component {
	constructor(props) {
		super(props);

		this.puppetEditorOpenedEventId = '';
		this.puppetEditorClosedEventId = '';
		
		// If user manually disabled hand tracking - hand tracking will not be enabled when puppet editor is closed.
		this.userDisabled = false;

		this.state = {
			trackingEnabled: true,
		};
	}
	
	componentWillMount() {
		this.puppetEditorOpenedEventId = eventManager.on('puppet-editor-opened', this.onPuppetEditorOpen.bind(this));
		this.puppetEditorClosedEventId = eventManager.on('puppet-editor-closed', this.onPuppetEditorClose.bind(this));
	}

	componentWillUnmount() {
		eventManager.remove(this.puppetEditorOpenedEventId);
		eventManager.remove(this.puppetEditorClosedEventId);
	}

	onPuppetEditorOpen() {
		this.setTrackingEnabled(false);
	}

	onPuppetEditorClose() {
		if (!this.userDisabled) {
			this.setTrackingEnabled(true);
		}
	}

	setTrackingEnabled(enabled) {
		this.setState({
			trackingEnabled: enabled,
		}, () => {
			dranimate.setHandTrackingEnabled(this.state.trackingEnabled);
		});
	}

	onTrackingToggle = (event) => {
		this.userDisabled = !event.target.checked;

		this.setTrackingEnabled(event.target.checked);
	};

	render() {
		return (
			<div className='toggleTrackingCheckboxContainer'>
				<label htmlFor="hand-tracking-toggle">
					Hand tracking
				</label>
				<input
					checked={this.state.trackingEnabled}
					id='hand-tracking-toggle'
					type='checkbox'
					onChange={this.onTrackingToggle}
				>
				</input>
			</div>
		);
	}
}

export default HandTrackingToolbar;
