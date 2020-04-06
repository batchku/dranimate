import React from 'react';

import './welcome-message.scss';

import eventManager from './../../services/eventManager/event-manager';

interface WelcomeMessageState {
	visible: boolean;
}

class WelcomeMessage extends React.Component<{}, WelcomeMessageState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			visible: true,
		};
	}

	public render = (): JSX.Element => {
		return (
			this.state.visible &&
			<div className='welcome-message-container' onClick={this.close}>
				<img className='welcome-message-image' src='./assets/welcome-message.svg' onClick={this.onAddPuppet}/>
			</div>
		);
	}

	private onAddPuppet = (): void => {
		eventManager.emit('on-add-puppet');
		
		this.close();
	}

	private close = (): void => {
		this.setState({
			visible: false,
		});
	}
}
export default WelcomeMessage;
