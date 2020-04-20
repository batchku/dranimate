import React from 'react';
import { v1 as uuid } from 'uuid';

import IconButton from './../primitives/icon-button/icon-button';

import DeleteIcon from './../../icons/delete-icon';
import RecorderIcon from './../../icons/recorder-icon';
import MoveToBackIcon from './../../icons/move-to-back-icon';
import MoveToFrontIcon from './../../icons/move-to-front-icon';
import EditIconProps from './../../icons/edit-icon';

import dranimate from './../../services/dranimate/dranimate';
import eventManager from 'services/eventManager/event-manager';
import puppetSelectedEvent, {PuppetSelectedEventData} from './../../services/eventManager/puppet-selected-event';
import userSignedInEvent, {UserSignedInEventData} from './../../services/eventManager/user-signed-in-event';
import showToastEvent from 'services/eventManager/show-toast-event';

import './puppet-toolbar.scss';

interface PuppetToolbarState {
	selectedPuppet: boolean;
	userSignedIn: boolean;
	recordStep: number;
}

class PuppetToolbar extends React.Component<{}, PuppetToolbarState> {
	private _puppetSelectedEventId = uuid();
	private _userSignedInEventId = uuid();
	private _recordIntervalHandle: number;

	constructor(props: {}) {
		super(props);

		this.state = {
			selectedPuppet: null,
			userSignedIn: false,
			recordStep: 0,
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
				<IconButton disabled={!this.state.selectedPuppet} tooltip='Record animation (R)' onClick={this.onRecordPuppetToggle}>
					{this.state.recordStep === 0 && <RecorderIcon fill='#FFFFFF' opacity={opacity} />}
					{this.state.recordStep === 1 && <img src='./assets/timer-3.svg' />}
					{this.state.recordStep === 2 && <img src='./assets/timer-2.svg' />}
					{this.state.recordStep === 3 && <img src='./assets/timer-1.svg' />}
					{this.state.recordStep === 4 && <img src='./assets/small-stop.svg' />}
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

	private onRecordPuppetToggle = (): void => {
		if (this.state.recordStep > 0) {
			this.setState({
				recordStep: 0,
			});
			if (this._recordIntervalHandle) {
				window.clearInterval(this._recordIntervalHandle);
			}

			if (this.state.recordStep === 4) {
				dranimate.setRecording(false);
				dranimate.getSelectedPuppet().playRecording = true;
				showToastEvent.emit({
					text: 'Animation recording finished. Your puppet will keep playing the recording on loop.',
					duration: 8,
				});
			}
			return;
		}

		this.setState({
			recordStep: this.state.recordStep + 1,
		}, () => {
			this._recordIntervalHandle = window.setInterval(() => {
				this.setState({
					recordStep: this.state.recordStep + 1,
				}, () => {
					if (this.state.recordStep === 4) {
						window.clearInterval(this._recordIntervalHandle);
						dranimate.setRecording(true);
						showToastEvent.emit({
							text: 'Animation recording has started.',
							duration: 4,
						});
					}
				});
			}, 1000);
		})
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
