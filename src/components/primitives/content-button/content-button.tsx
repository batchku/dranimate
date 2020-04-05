import React from 'react';

import './content-button.scss';

interface ContentButtonProps {
	label?: string;
}

class ContentButton extends React.Component<ContentButtonProps, {}> {
	constructor(props: ContentButtonProps) {
		super(props);
	}

	public render = (): JSX.Element => {
		return (
			<div className='content-button-background'>
				<div className='content-button-center' style={{
					paddingLeft: this.props.label ? '20px' : '8px',
					paddingRight: this.props.label ? '20px' : '8px'
				}}>
					{this.props.children}
					{this.props.label &&
					<p className='content-button-label'>
						{this.props.label}
					</p>}
				</div>
			</div>
		);
	}
}
export default ContentButton;
