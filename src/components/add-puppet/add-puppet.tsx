import React from 'react';

import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';

import eventManager from 'services/eventManager/event-manager';

import './add-puppet.scss';
import { createLivedrawPuppet } from 'services/puppet/puppet-factory';
import dranimate from 'services/dranimate/dranimate';

interface AddPuppetState {
	open: boolean;
}

class AddPuppet extends React.Component<{}, AddPuppetState> {
	constructor(props: {}) {
		super(props);

		this.state = {
			open: false
		}
	}

	private onOpen = (): void => {
		this.setState({
			open: true
		});
	}

	private onClose = (): void => {
		this.setState({
			open: false
		});
	}

	public render(): JSX.Element {
		return (
			<div className='add-puppet-container'>
				<SpeedDial
					open={this.state.open}
					onOpen={this.onOpen}
					onClose={this.onClose}
					ariaLabel='add-puppet'
					direction='up'
					icon={<SpeedDialIcon />}
				>
					<SpeedDialAction
						key='add-puppet'
						tooltipTitle='Add puppet'
						onClick={this.onAddPuppet}
					/>
					<SpeedDialAction
						key='add-livedraw-puppet'
						tooltipTitle='Add livedraw puppet'
						onClick={this.onAddLivedrawPuppet}
					/>
				</SpeedDial>
			</div>
		);
	}

	private onAddPuppet = (): void => {
		this.setState({
			open: false
		}, () => {
			eventManager.emit('on-add-puppet', {
				puppetType: 'standard'
			});
		});
	}

	private onAddLivedrawPuppet = (): void => {
		const puppet = createLivedrawPuppet();

		dranimate.addPuppet(puppet);
	}
}

export default AddPuppet;
