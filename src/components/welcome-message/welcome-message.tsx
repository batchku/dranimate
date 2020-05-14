import React from 'react';
import { v1 as uuid } from 'uuid';

import './welcome-message.scss';

import eventManager from 'services/eventManager/event-manager';
import puppetAddedOnStageEvent from 'services/eventManager/puppet-added-on-stage-event';

interface WelcomeMessageState {
	visible: boolean;
}

class WelcomeMessage extends React.Component<{}, WelcomeMessageState> {
	private _puppetAddedOnStageEventId = uuid();

	constructor(props: {}) {
		super(props);

		this.state = {
			visible: true,
		};
	}

	public componentDidMount = (): void => {
		puppetAddedOnStageEvent.subscribe({
			callback: this.close,
			id: this._puppetAddedOnStageEventId
		});
	}

	public componentWillUnmount = (): void => {
		puppetAddedOnStageEvent.unsubscribe(this._puppetAddedOnStageEventId);
	}

	public render = (): JSX.Element => {
		return (
			this.state.visible &&
			<div className='welcome-message-container'>
				<img className='welcome-message-image' src='./assets/welcome-message.svg' onClick={this.onAddPuppet}/>
			</div>
		);
	}

	private onAddPuppet = (): void => {
		eventManager.emit('on-add-puppet', {});
	}

	private close = (): void => {
		this.setState({
			visible: false,
		});
	}
}
export default WelcomeMessage;
