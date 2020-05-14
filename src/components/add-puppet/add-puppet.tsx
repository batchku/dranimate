import React from 'react';

import Fab from 'components/primitives/fab-v2/fab';
import Icon from 'components/primitives/icon/icon';

import eventManager from 'services/eventManager/event-manager';

import './add-puppet.scss';

class AddPuppet extends React.Component {
	public render(): JSX.Element {
		return (
			<div className='add-puppet-container'>
				<Fab onClick={this.onAddPuppet}>
					<Icon url='./assets/plus.svg'/>
				</Fab>
			</div>
		);
	}

	private onAddPuppet = (): void => {
		eventManager.emit('on-add-puppet', {});
	}
}

export default AddPuppet;
