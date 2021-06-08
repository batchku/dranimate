import React, { Component } from 'react';

import eventManager from '../../services/eventManager/event-manager';
import dranimate from '../../services/dranimate/dranimate';

import './styles.scss';

class PuppetRecorderToolbar extends Component {
	constructor(props) {
		super(props);

		this.puppetSelectedEventId = '';
		this.puppetRecordToggleEventId = '';
		this.puppetPlayToggleEventId = '';

		this.state = {
			playEnabled: false,
			recordEnabled: false,
			puppetPlaying: false,
			puppetRecording: false,
		};

		this.puppetSelected = this.puppetSelected.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
	}

	componentDidMount() {
		this.puppetSelectedEventId = eventManager.on('puppet-selected', this.puppetSelected);

		window.addEventListener('keydown', this.onKeyDown);
	}

	componentWillUnmount() {
		eventManager.remove(this.puppetSelectedEventId);

		window.removeEventListener('keydown', this.onKeyDown);
	}

	puppetSelected(data) {
		this.setState({
			recordEnabled: data.selected && !data.hasRecording,
			playEnabled: data.selected && data.hasRecording,
		});
	}

	onKeyDown(event) {
		if (event.key === 'r') {
			this.toggleRecord(!this.state.puppetRecording);
		}
		if (event.key === ' ') {
			this.togglePlay(!this.state.puppetPlaying);
		}
	}

	onPlayToggle = (event) => {
		this.togglePlay(event.target.checked);
	}

	togglePlay(enabled) {
		if (!this.state.playEnabled) {
			return;
		}

		this.setState({
			puppetPlaying: enabled
		}, () => {
			dranimate.getSelectedPuppet().playing = this.state.puppetPlaying;
		});
	}

	onRecordToggle = (event) => {
		this.toggleRecord(event.target.checked);
	};

	toggleRecord(enabled) {
		this.setState({
			puppetRecording: enabled
		}, () => {
			dranimate.setRecording(this.state.puppetRecording);
		});
	}

	render() {
		return (
			<div className='puppet-recorder-container'>
				{/* Checkbox to play/stop recorded animation for selected puppet */}
				<label htmlFor="puppet-play-toggle">
					Play:
				</label>
				<input
					disabled={this.state.playEnabled ? '' : 'disabled'}
					checked={this.state.puppetPlaying}
					id='puppet-play-toggle'
					type='checkbox'
					onChange={this.onPlayToggle}
				>
				</input>

				{/* Checkbox to start/stop recording animation for selected puppet */}
				<label htmlFor="puppet-record-toggle">
					Record:
				</label>
				<input
					disabled={this.state.recordEnabled ? '' : 'disabled'}
					checked={this.state.puppetRecording}
					id='puppet-record-toggle'
					type='checkbox'
					onChange={this.onRecordToggle}
				>
				</input>
			</div>
		);
	}
}

export default PuppetRecorderToolbar;
