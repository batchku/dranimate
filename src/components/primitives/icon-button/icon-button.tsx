import React from 'react';

import './icon-button.scss';

class IconButton extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='icon-button-container'>
				{this.props.children}
			</div>
		);
	}
}
export default IconButton;
