import React from 'react';

import './circular-progress.scss';

export default class CircularProgress extends React.Component<{}, {}> {
	constructor(props: {}) {
		super(props)
	}

	public render = (): JSX.Element => {
		return (
			<progress className='circular-progress' />
		);
	}
}