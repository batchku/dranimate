import React from 'react';

import './icon.scss';

interface IconProps {
	url: string;
}

class Icon extends React.Component<IconProps, {}> {
	constructor(props: IconProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='icon-container'>
				<img className='icon-image' src={this.props.url} />
			</div>
		);
	}
}
export default Icon;
