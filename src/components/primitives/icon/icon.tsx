import React from 'react';

import './icon.scss';

export enum IconSize {
	SMALL = '16px',
	MEDIUM = '24px',
	LARGE = '32px',
}

interface IconProps {
	url: string;
	size?: IconSize;
}

class Icon extends React.Component<IconProps, {}> {
	constructor(props: IconProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div style={{
				width: this.props.size || IconSize.MEDIUM,
				height: this.props.size || IconSize.MEDIUM,
			}}>
				<img className='icon-image' src={this.props.url} />
			</div>
		);
	}
}
export default Icon;
