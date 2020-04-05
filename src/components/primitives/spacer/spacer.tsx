import React from 'react';

interface SpacerProps {
	size: number;
}

class Spacer extends React.Component<SpacerProps, {}> {
	constructor(props: SpacerProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div style={{
				width: this.props.size,
				height: this.props.size,
			}} />
		);
	}
}
export default Spacer;
