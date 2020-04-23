import React from 'react';

import './dialog-body.scss';

export default class DialogBody extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='dialog-body'>
				{this.props.children}
			</div>
		);
	}
}
