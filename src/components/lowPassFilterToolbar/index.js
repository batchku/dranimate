import React, { Component } from 'react';

import eventManager from '../../services/eventManager/event-manager';

import styles from './styles.scss';

class LowPassFilterToolbar extends Component {
	constructor(props) {
		super(props);

		this.puppetEditorOpenedEventId = '';
		this.puppetEditorClosedEventId = '';
		
		// If user manually disabled hand tracking - hand tracking will not be enabled when puppet editor is closed.
		this.userDisabled = false;

		this.state = {
			sampleCount: 4,
			lowPassFilterEnabled: true,
		};
	}

	onLowPassFilterToggle = (event) => {
		this.setState({
			lowPassFilterEnabled: event.target.checked
		}, () => {
			eventManager.emit('low-pass-filter-toggle', this.state.lowPassFilterEnabled);
		});
	};

	onSampleCountChange = (event) => {
		this.setState({
			sampleCount: event.target.value
		}, () => {
			eventManager.emit('low-pass-filter-samples-set', this.state.sampleCount);
		});
	}

	render() {
		return (
			<div className={styles.container}>
				{/* Checkbox to turn low pass filter on/off */}
				<label htmlFor="hand-tracking-toggle">
					Low pass filter:
				</label>
				<input
					checked={this.state.lowPassFilterEnabled}
					id='hand-tracking-toggle'
					type='checkbox'
					onChange={this.onLowPassFilterToggle}
				>
				</input>

				{/* Number input to set number of samples for low pass filter */}
				<label className={styles.samplesLabel} for="filterSamples">
					Low pass filter samples:
				</label>
				<input
					className={styles.samplesInput}
					type="number"
					min={1}
					id="filterSamples"
					name="filterSamples"
					value={this.state.sampleCount}
					onChange={this.onSampleCountChange}
				>
				</input>
			</div>
		);
	}
}

export default LowPassFilterToolbar;
