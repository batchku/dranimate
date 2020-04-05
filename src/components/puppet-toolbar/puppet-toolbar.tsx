import React from 'react';
import { v1 as uuid } from 'uuid';

import IconButton from './../primitives/icon-button/icon-button';
import Icon from './../primitives/icon/icon';

import DeleteIcon from './../../icons/delete-icon';
import SaveIcon from './../../icons/save-icon';
import MoveToBackIcon from './../../icons/move-to-back-icon';
import MoveToFrontIcon from './../../icons/move-to-front-icon';
import EditIconProps from './../../icons/edit-icon';

import puppetSelectedEvent, {PuppetSelectedEventData} from './../../services/eventManager/puppet-selected-event';

import './puppet-toolbar.scss';

interface PuppetToolbarState {
	puppetSelected: boolean;
}

class PuppetToolbar extends React.Component<{}, PuppetToolbarState> {
	private _puppetSelectedEventId = uuid();

	constructor(props: {}) {
		super(props);

		this.state = {
			puppetSelected: false,
		};
	}

	public componentDidMount = (): void => {
		puppetSelectedEvent.subscribe({
			callback: this.onPuppetSelected,
			id: this._puppetSelectedEventId,
		});
	}

	public componentWillUnmount = (): void => {
		puppetSelectedEvent.unsubscribe(this._puppetSelectedEventId);
	}

	public render = (): JSX.Element => {
		const opacity = this.state.puppetSelected ? '0.7' : '0.2';

		return (
			<div className='puppet-toolbar-container'>
				<IconButton>
					<EditIconProps fill='#FFFFFF' opacity={opacity} />
				</IconButton>
				<IconButton>
					<MoveToFrontIcon fill='#FFFFFF' opacity={opacity} />
				</IconButton>
				<IconButton>
					<MoveToBackIcon fill='#FFFFFF' opacity={opacity} />
				</IconButton>
				<IconButton>
					<SaveIcon fill='#FFFFFF' opacity={opacity} />
				</IconButton>
				<IconButton>
					<DeleteIcon fill='#FFFFFF' opacity={opacity} />
				</IconButton>
			</div>
		);
	}

	private onPuppetSelected = (data: PuppetSelectedEventData): void => {
		this.setState({
			puppetSelected: Boolean(data.puppet)
		});
	}
}
export default PuppetToolbar;
