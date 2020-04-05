import React from 'react';

import './logo.scss';

class Logo extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='logo-container'>
				<img src='./assets/logo.svg' />
			</div>
		);
	}
}
export default Logo;
