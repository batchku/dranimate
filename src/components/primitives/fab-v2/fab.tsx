import React from 'react';

import './fab.scss';

class FabButton extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='fab-container'>
				{this.props.children}
			</div>
		);
	}
}
export default FabButton;
