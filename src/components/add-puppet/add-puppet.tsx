import React from 'react';

import Fab from 'components/primitives/fab-v2/fab';
import Icon from 'components/primitives/icon/icon';

import './add-puppet.scss';

class AddPuppet extends React.Component {
	public render(): JSX.Element {
		return (
			<div className='add-puppet-container'>
				<Fab>
					<Icon url='./assets/plus.svg'/>
				</Fab>
			</div>
		);
	}
}

export default AddPuppet;
