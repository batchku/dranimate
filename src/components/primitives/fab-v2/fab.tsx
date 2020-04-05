import React from 'react';

import './fab.scss';

interface FabProps {
	onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

class Fab extends React.Component<FabProps, {}> {
	constructor(props: FabProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='fab-container' onClick={this.props.onClick}>
				{this.props.children}
			</div>
		);
	}
}
export default Fab;
