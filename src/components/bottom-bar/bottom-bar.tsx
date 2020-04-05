import React from 'react';

import AddPuppet from 'components/add-puppet/add-puppet';

import './bottom-bar.scss';

class BottomBar extends React.Component {
	public render(): JSX.Element {
		return (
			<div className='bottom-bar-container'>
				<AddPuppet />
			</div>
		);
	}
}

export default BottomBar;
