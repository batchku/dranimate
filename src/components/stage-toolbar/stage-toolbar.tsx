import React from 'react';

import IconButton from './../primitives/icon-button/icon-button';
import Icon from './../primitives/icon/icon';

import './stage-toolbar.scss';

class StageToolbar extends React.Component {
	constructor(props: {}) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='stage-toolbar-container'>
				<IconButton>
					<Icon url='./assets/pan.svg' />
				</IconButton>
				<IconButton>
					<Icon url='./assets/zoom-in.svg' />
				</IconButton>
				<IconButton>
					<Icon url='./assets/zoom-out.svg' />
				</IconButton>
			</div>
		);
	}
}
export default StageToolbar;
