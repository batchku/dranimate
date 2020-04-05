import React from 'react';

import IconButton from './../primitives/icon-button/icon-button';
import Icon from './../primitives/icon/icon';

import './puppet-toolbar.scss';

class PuppetToolbar extends React.Component {
	constructor(props: {}) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='puppet-toolbar-container'>
				<IconButton>
					<Icon url='./assets/edit-default.svg' />
				</IconButton>
				<IconButton>
					<Icon url='./assets/move-to-front-default.svg' />
				</IconButton>
				<IconButton>
					<Icon url='./assets/move-to-back-default.svg' />
				</IconButton>
				<IconButton>
					<Icon url='./assets/save-default.svg' />
				</IconButton>
				<IconButton>
					<Icon url='./assets/delete-default.svg' />
				</IconButton>
			</div>
		);
	}
}
export default PuppetToolbar;
