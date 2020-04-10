import React from 'react';
import { v1 as uuid } from 'uuid';

import IconButton from './../primitives/icon-button/icon-button';

import DeleteIcon from './../../icons/delete-icon';
import SaveIcon from './../../icons/save-icon';
import MoveToBackIcon from './../../icons/move-to-back-icon';
import MoveToFrontIcon from './../../icons/move-to-front-icon';
import EditIconProps from './../../icons/edit-icon';

import dranimate from './../../services/dranimate/dranimate';
import eventManager from 'services/eventManager/event-manager';
import apiService from './../../services/api/apiService';
import puppetSelectedEvent, {PuppetSelectedEventData} from './../../services/eventManager/puppet-selected-event';
import userSignedInEvent, {UserSignedInEventData} from './../../services/eventManager/user-signed-in-event';

import './puppet-toolbar.scss';

interface PuppetToolbarState {
	selectedPuppet: boolean;
	userSignedIn: boolean;
}

class PuppetToolbar extends React.Component<{}, PuppetToolbarState> {
	private _puppetSelectedEventId = uuid();
	private _userSignedInEventId = uuid();

	constructor(props: {}) {
		super(props);

		this.state = {
			selectedPuppet: null,
			userSignedIn: false,
		};
	}

	public componentDidMount = (): void => {
		puppetSelectedEvent.subscribe({
			callback: this.onPuppetSelected,
			id: this._puppetSelectedEventId,
		});
		userSignedInEvent.subscribe({
			callback: this.onUserSignedId,
			id: this._userSignedInEventId,
		});
	}

	public componentWillUnmount = (): void => {
		puppetSelectedEvent.unsubscribe(this._puppetSelectedEventId);
		userSignedInEvent.unsubscribe(this._userSignedInEventId);
	}

	public render = (): JSX.Element => {
		const opacity = this.state.selectedPuppet ? '0.7' : '0.2';
		const saveIconOpacity = (!this.state.selectedPuppet || !this.state.userSignedIn) ? '0.2' : '0.7';

		return (
			<div className='puppet-toolbar-container'>
				<IconButton disabled={!this.state.selectedPuppet} tooltip='Edit' onClick={this.onEditPuppet}>
					<EditIconProps fill='#FFFFFF' opacity={opacity} />
				</IconButton>
				<IconButton disabled={!this.state.selectedPuppet} tooltip='Move to front' onClick={this.onMoveToFront}>
					<MoveToFrontIcon fill='#FFFFFF' opacity={opacity} />
				</IconButton>
				<IconButton disabled={!this.state.selectedPuppet} tooltip='Move to back' onClick={this.onMoveToBack}>
					<MoveToBackIcon fill='#FFFFFF' opacity={opacity} />
				</IconButton>
				<IconButton disabled={!this.state.selectedPuppet || !this.state.userSignedIn} tooltip='Save' onClick={this.onSavePuppetToServer}>
					<SaveIcon fill='#FFFFFF' opacity={saveIconOpacity} />
				</IconButton>
				<IconButton disabled={!this.state.selectedPuppet} tooltip='Delete' onClick={this.onDeletePuppet}>
					<DeleteIcon fill='#FFFFFF' opacity={opacity} />
				</IconButton>
			</div>
		);
	}

	private onPuppetSelected = (data: PuppetSelectedEventData): void => {
		this.setState({
			selectedPuppet: data.puppet
		});
	}

	private onDeletePuppet = (): void => {
		if (!this.state.selectedPuppet) {
			return;
		}

		dranimate.deleteSelectedPuppet();

		this.setState({
			selectedPuppet: false,
		});
	}

	private onSavePuppetToServer = async(): Promise<void> => {
		if (!this.state.selectedPuppet) {
			return;
		}

		eventManager.emit('open-loader', 'Saving puppet');
		try {
			await apiService.savePuppet(this.state.selectedPuppet);
		}
		catch (e) {
			console.error(e);
		}
		finally {
			eventManager.emit('close-loader');
		}
	}

	private onMoveToFront = (): void => {
		dranimate.movePuppet(this.state.selectedPuppet, 1);
	}

	private onMoveToBack = (): void => {
		dranimate.movePuppet(this.state.selectedPuppet, -1);
	}

	private onEditPuppet = (): void => {
		eventManager.emit('edit-puppet');
	}

	private onUserSignedId = (data: UserSignedInEventData): void => {
		this.setState({
			userSignedIn: Boolean(data.user),
		});
	}
}
export default PuppetToolbar;
