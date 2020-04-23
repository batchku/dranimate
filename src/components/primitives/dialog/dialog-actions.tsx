import React from 'react';

import './dialog-actions.scss';

export default class DialogActions extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='dialog-actions'>
				{this.props.children}
			</div>
		);
	}
}
