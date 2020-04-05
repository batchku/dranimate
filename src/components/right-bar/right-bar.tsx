import React from 'react';

import StageToolbar from 'components/stage-toolbar/stage-toolbar';

import './right-bar.scss';

class RightBar extends React.Component {
	public render(): JSX.Element {
		return (
			<div className='right-bar-container'>
				<StageToolbar />
			</div>
		);
	}
}

export default RightBar;
